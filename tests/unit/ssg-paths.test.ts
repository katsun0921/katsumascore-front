import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.WP_API_URL = 'https://wp.example/wp-json/wp/v2';
process.env.USE_WP_MOCK = 'false';
delete process.env.WP_BUILD_TOKEN;
delete process.env.WP_SSG_BUILD;
const originalFetch = globalThis.fetch;

/** エンドポイントごとの配列を、WPのページネーションヘッダー付きで返すfetchモックを作る。 */
const mockCollections = (collections: Record<string, unknown[]>): typeof fetch => async (input) => {
  const endpoint = new URL(String(input)).pathname.split('/').pop() ?? '';
  const data = collections[endpoint] ?? [];
  return Response.json(data, { headers: { 'X-WP-TotalPages': '1', 'X-WP-Total': String(data.length) } });
};

// グローバルfetchを置換する検証は直列に実行し、最後に必ず戻す。
test('詳細SSGのパス列挙', async (t) => {
  const { makeDetailStaticPaths, makePostStaticPaths, seasonalDetailStaticPaths } =
    await import('../../src/libs/api/wordpress/staticPaths');

  try {
    await t.test('固定ページは固定ルートと衝突するslugを除き、defaultを除く全ロケールへ展開する', async () => {
      globalThis.fetch = mockCollections({
        pages: [
          { id: 1, slug: 'about' },
          { id: 2, slug: 'privacy-policy' },
          { id: 3, slug: 'seasonal-reviews' },
          { id: 4, slug: 'company-info' },
        ],
      });
      const result = await makeDetailStaticPaths('pages', ['ja'])({ locales: ['default', 'ja', 'en'] });
      assert.equal(result.fallback, 'blocking');
      assert.deepEqual(result.paths, [
        { params: { slug: 'company-info' }, locale: 'ja' },
      ]);
    });

    await t.test('固定ページ以外のコレクションではslugを除外しない', async () => {
      globalThis.fetch = mockCollections({ persons: [{ id: 1, slug: 'about' }, { id: 2, slug: 'tom' }] });
      const result = await makeDetailStaticPaths('persons')({ locales: ['default', 'ja', 'en'] });
      assert.deepEqual(
        result.paths.map((path) => typeof path === 'string' ? path : `${path.locale}:${path.params.slug}`),
        ['ja:about', 'ja:tom', 'en:about', 'en:tom'],
      );
    });

    await t.test('ロケール指定がなければja/enで生成する', async () => {
      globalThis.fetch = mockCollections({ companies: [{ id: 1, slug: 'acme' }] });
      const result = await makeDetailStaticPaths('companies')({});
      assert.equal(result.paths.length, 2);
    });

    await t.test('季節レビューはCPTと旧子ページを重複なく両ロケールへ展開する', async () => {
      globalThis.fetch = mockCollections({
        seasonal_review: [{ id: 10, slug: '2026-summer' }],
        pages: [
          { id: 1, slug: 'seasonal-anime-and-dramas-reviews' },
          { id: 2, slug: '2025-winter', parent: 1 },
          { id: 3, slug: '2026-summer', parent: 1 },
          { id: 4, slug: 'unrelated', parent: 99 },
        ],
      });
      const result = await seasonalDetailStaticPaths({ locales: ['default', 'ja', 'en'] });
      assert.equal(result.fallback, 'blocking');
      assert.deepEqual(result.paths, [
        { params: { slug: '2026-summer' }, locale: 'ja' },
        { params: { slug: '2025-winter' }, locale: 'ja' },
        { params: { slug: '2026-summer' }, locale: 'en' },
        { params: { slug: '2025-winter' }, locale: 'en' },
      ]);
    });

    await t.test('季節レビューの親ページが無ければ子ページ分は追加しない', async () => {
      globalThis.fetch = mockCollections({
        seasonal_review: [{ id: 10, slug: '2026-summer' }],
        pages: [{ id: 2, slug: '2025-winter', parent: 1 }],
      });
      const result = await seasonalDetailStaticPaths({ locales: ['ja'] });
      assert.deepEqual(result.paths, [{ params: { slug: '2026-summer' }, locale: 'ja' }]);
    });

    await t.test('記事はlocalesに無い言語を除き、ACF未設定ならlinkで言語を判定する', async () => {
      globalThis.fetch = mockCollections({
        categories: [{ id: 3, slug: 'movie' }, { id: 4, slug: 'anime' }],
        posts: [
          { id: 1, slug: 'ja-film', categories: [3], acf: { lang: 'ja' } },
          { id: 2, slug: 'en-film', categories: [3], acf: { lang: 'en' } },
          { id: 3, slug: 'en-by-link', categories: [3], link: 'https://wp.example/en/movie/en-by-link/', acf: [] },
          { id: 4, slug: 'no-category', categories: [], acf: { lang: 'ja' } },
          { id: 5, slug: 'anime-film', categories: [4], acf: { lang: 'ja' } },
        ],
      });
      const both = await makePostStaticPaths('movie')({ locales: ['default', 'ja', 'en'] });
      assert.deepEqual(both.paths, [
        { params: { slug: 'ja-film' }, locale: 'ja' },
        { params: { slug: 'en-film' }, locale: 'en' },
        { params: { slug: 'en-by-link' }, locale: 'en' },
        // 未分類は resolvePostType の既定どおり movie として扱う
        { params: { slug: 'no-category' }, locale: 'ja' },
      ]);
      const anime = await makePostStaticPaths('anime')({ locales: ['ja', 'en'] });
      assert.deepEqual(anime.paths, [{ params: { slug: 'anime-film' }, locale: 'ja' }]);
      const jaOnly = await makePostStaticPaths('movie')({ locales: ['ja'] });
      assert.deepEqual(jaOnly.paths, [
        { params: { slug: 'ja-film' }, locale: 'ja' },
        { params: { slug: 'no-category' }, locale: 'ja' },
      ]);
    });

    await t.test('slugが無い不正なエントリは非strictでは事前生成をスキップし、strictでは失敗する', async () => {
      globalThis.fetch = mockCollections({ persons: [{ id: 1, slug: '' }] });
      assert.deepEqual(await makeDetailStaticPaths('persons')({ locales: ['ja'] }), { paths: [], fallback: 'blocking' });
      process.env.WP_SSG_BUILD = '1';
      process.env.WP_BUILD_TOKEN = 'test-only-token';
      try {
        await assert.rejects(async () => makeDetailStaticPaths('persons')({ locales: ['ja'] }), /invalid path entry/);
      } finally {
        delete process.env.WP_SSG_BUILD;
        delete process.env.WP_BUILD_TOKEN;
      }
    });
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.WP_SSG_BUILD;
    delete process.env.WP_BUILD_TOKEN;
  }
});
