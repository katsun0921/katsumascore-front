import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

process.env.WP_API_URL = 'https://wp.example/wp-json/wp/v2';
process.env.USE_WP_MOCK = 'false';
const originalFetch = globalThis.fetch;

// グローバルfetchを置換する検証は直列に実行し、最後に必ず戻す。
test('WP通信と詳細SSGの契約', async (t) => {
const { wpFetch, WpRequestError } = await import('../../src/libs/api/wordpress/transport');
const { getAllStaticEntries, makePostStaticPaths, formatVodSnapshotDate } = await import('../../src/libs/api/wordpress/staticPaths');

  try {
    await t.test('同時実行は4件以下・ビルド中のみ共有・トークンはWPだけ', async () => {
      process.env.WP_SSG_BUILD = '1';
      process.env.WP_BUILD_TOKEN = 'test-only-token';
      let active = 0;
      let peak = 0;
      let calls = 0;
      globalThis.fetch = async (_url, init) => {
        assert.equal(new Headers(init?.headers).get('x-build-token'), 'test-only-token');
        active += 1;
        peak = Math.max(peak, active);
        calls += 1;
        await new Promise((resolve) => setTimeout(resolve, 5));
        active -= 1;
        return Response.json([{ id: 1 }]);
      };
      const urls = Array.from({ length: 12 }, (_, i) => `https://wp.example/wp-json/wp/v2/posts?test=${i}`);
      const responses = await Promise.all([...urls, urls[0]].map((url) => wpFetch(url)));
      assert.equal(peak, 4);
      assert.equal(calls, 12);
      for (const response of responses) assert.deepEqual(await response.json(), [{ id: 1 }]);
      delete process.env.WP_SSG_BUILD;
      await wpFetch(urls[0]);
      assert.equal(calls, 13);
      await assert.rejects(wpFetch('https://other.example/wp-json/wp/v2/posts'), WpRequestError);
      assert.equal(calls, 13);
      delete process.env.WP_BUILD_TOKEN;
      globalThis.fetch = async (_url, init) => {
        assert.equal(new Headers(init?.headers).has('x-build-token'), false);
        return Response.json([]);
      };
      await wpFetch(urls[0]);
    });

    await t.test('5xxは最大3回再試行し、失敗は空配列や404に変換しない', async () => {
      process.env.WP_SSG_BUILD = '1';
      process.env.WP_BUILD_TOKEN = 'test-only-token';
      let calls = 0;
      globalThis.fetch = async () => { calls += 1; return new Response('', { status: 503 }); };
      await assert.rejects(wpFetch('https://wp.example/wp-json/wp/v2/posts'), WpRequestError);
      assert.equal(calls, 4);
      calls = 0;
      globalThis.fetch = async () => {
        calls += 1;
        return calls === 1 ? new Response('', { status: 507 }) : Response.json([]);
      };
      assert.deepEqual(await (await wpFetch('https://wp.example/wp-json/wp/v2/posts')).json(), []);
      assert.equal(calls, 2);
      globalThis.fetch = async () => new Response('', { status: 403 });
      const { getPostBySlug } = await import('../../src/libs/api/wordpress/endpoints/posts');
      await assert.rejects(getPostBySlug('not-an-actual-404'), WpRequestError);
    });

    await t.test('100件単位で全ページを列挙し、途中失敗・ヘッダー欠落を検知する', async () => {
      const pages: number[] = [];
      globalThis.fetch = async (input) => {
        const url = new URL(String(input));
        assert.equal(url.searchParams.get('per_page'), '100');
        assert.equal(url.searchParams.get('acf_format'), 'standard');
        const page = Number(url.searchParams.get('page'));
        pages.push(page);
        const size = page === 12 ? 1 : 100;
        return Response.json(Array.from({ length: size }, (_, i) => ({ id: (page - 1) * 100 + i, slug: `person-${page}-${i}` })), {
          headers: { 'X-WP-TotalPages': '12', 'X-WP-Total': '1101' },
        });
      };
      assert.equal((await getAllStaticEntries('persons')).length, 1101);
      assert.equal(pages.length, 12);
      globalThis.fetch = async () => Response.json([]);
      await assert.rejects(getAllStaticEntries('persons-missing-headers'), /pagination headers missing/);
      globalThis.fetch = async () => Response.json([], { headers: { 'X-WP-TotalPages': '2', 'X-WP-Total': '1' } });
      await assert.rejects(getAllStaticEntries('persons-incomplete'), /changed or incomplete/);
    });

    await t.test('記事は対応カテゴリ・ACF言語のみ、blockingのパスを生成する', async () => {
      globalThis.fetch = async (input) => {
        const categories = String(input).includes('/categories?');
        const data = categories ? [{ id: 3, slug: 'movie' }, { id: 4, slug: 'anime' }] : [
          { id: 1, slug: 'ja-film', categories: [3], acf: { lang: 'ja' } },
          { id: 2, slug: 'en-film', categories: [3], acf: { lang: 'en' } },
          { id: 3, slug: 'anime', categories: [4], acf: { lang: 'ja' } },
        ];
        return Response.json(data, { headers: { 'X-WP-TotalPages': '1', 'X-WP-Total': String(data.length) } });
      };
      const result = await makePostStaticPaths('movie')({ locales: ['default', 'ja', 'en'] });
      assert.equal(result.fallback, 'blocking');
      assert.deepEqual(result.paths, [
        { params: { slug: 'ja-film' }, locale: 'ja' },
        { params: { slug: 'en-film' }, locale: 'en' },
      ]);
    });

    await t.test('未生成記事も生成時の日付を持ち、不存在と他言語は404になる', async () => {
      process.env.USE_WP_MOCK = 'true';
      const require = createRequire(import.meta.url);
      const imageExtensions = ['.webp', '.png', '.jpg', '.svg'];
      const previousLoaders = imageExtensions.map((extension) => require.extensions[extension]);
      imageExtensions.forEach((extension) => {
        require.extensions[extension] = (module, filename) => { module.exports = { src: filename, width: 1, height: 1 }; };
      });
      try {
        const { makeGetStaticProps } = await import('../../src/libs/loadPostDetailPage');
        const load = makeGetStaticProps();
        const result = await load({ params: { slug: 'hanataba-review' }, locale: 'ja' });
        assert.ok('props' in result);
        if ('props' in result) {
          const props = await result.props;
          assert.equal(props.post.vodSnapshotDate, formatVodSnapshotDate());
          assert.equal('revalidate' in result, false);
        }
        assert.deepEqual(await load({ params: { slug: 'ssg-unknown-path' }, locale: 'ja' }), { notFound: true });
        assert.deepEqual(await load({ params: { slug: 'hanataba-review' }, locale: 'en' }), { notFound: true });
      } finally {
        process.env.USE_WP_MOCK = 'false';
        imageExtensions.forEach((extension, index) => {
          const loader = previousLoaders[index];
          if (loader) require.extensions[extension] = loader;
          else delete require.extensions[extension];
        });
      }
    });

    await t.test('トークン未設定の403は継続し、登録済みビルドだけ失敗する', async () => {
      const { getPostBySlug } = await import('../../src/libs/api/wordpress/endpoints/posts');
      const { getFeaturedPages } = await import('../../src/libs/api/wordpress/endpoints/pages');
      const { makeDetailStaticPaths } = await import('../../src/libs/api/wordpress/staticPaths');
      globalThis.fetch = async () => new Response('', { status: 403 });
      delete process.env.WP_BUILD_TOKEN;
      process.env.WP_SSG_BUILD = '1';
      assert.equal(await getPostBySlug('compat-403'), null);
      assert.deepEqual(await getFeaturedPages(), []);
      assert.deepEqual(await makeDetailStaticPaths('persons-403')({ locales: ['ja', 'en'] }), { paths: [], fallback: 'blocking' });
      process.env.WP_BUILD_TOKEN = '   ';
      assert.equal(await getPostBySlug('compat-blank-token'), null);
      process.env.WP_BUILD_TOKEN = 'test-only-token';
      await assert.rejects(getPostBySlug('strict-403'), WpRequestError);
      await assert.rejects(getFeaturedPages(), WpRequestError);
      await assert.rejects(getAllStaticEntries('persons-403'), WpRequestError);
      delete process.env.WP_SSG_BUILD;
      assert.equal(await getPostBySlug('runtime-403'), null);
      assert.deepEqual(await getFeaturedPages(), []);
    });

    await t.test('JST日付はUTCの日付境界をまたいで固定される', () => {
      assert.equal(formatVodSnapshotDate(new Date('2026-10-21T14:59:59Z')), '2026/10/21');
      assert.equal(formatVodSnapshotDate(new Date('2026-10-21T15:00:00Z')), '2026/10/22');
    });

    await t.test('全対象詳細はrevalidateなし・トップと一覧のISRは残る', async () => {
      for (const file of ['src/libs/loadPostDetailPage.ts', ...['person', 'company', 'franchise', 'theater-release', 'vod-release', 'seasonal-reviews'].map((kind) => `src/pages/${kind}/[slug].tsx`), 'src/pages/[slug].tsx']) {
        assert.doesNotMatch(await readFile(file, 'utf8'), /revalidate\s*:/, file);
      }
      assert.match(await readFile('src/pages/index.tsx', 'utf8'), /revalidate/);
      assert.match(await readFile('src/pages/movie/index.tsx', 'utf8'), /revalidate/);
      assert.doesNotMatch(await readFile('src/components/templates/PostDetail/PostDetail.tsx', 'utf8'), /useVodRelatedPosts/);
    });
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.WP_SSG_BUILD;
    delete process.env.WP_BUILD_TOKEN;
  }
});
