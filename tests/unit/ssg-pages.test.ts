import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import type { GetStaticProps } from 'next';
import { REVALIDATE_NOT_FOUND } from '../../src/config/revalidate.config';

process.env.WP_API_URL = 'https://wp.example/wp-json/wp/v2';
process.env.USE_WP_MOCK = 'false';
delete process.env.WP_BUILD_TOKEN;
delete process.env.WP_SSG_BUILD;
const originalFetch = globalThis.fetch;

/** ページが読み込む画像・スタイルをNodeで解決できるよう、空モジュールに差し替える。 */
const stubAssetModules = () => {
  const require = createRequire(import.meta.url);
  const extensions = ['.webp', '.png', '.jpg', '.svg', '.scss', '.css'];
  const previous = extensions.map((extension) => require.extensions[extension]);
  extensions.forEach((extension) => {
    require.extensions[extension] = (module, filename) => { module.exports = { src: filename, width: 1, height: 1 }; };
  });
  return () => extensions.forEach((extension, index) => {
    const loader = previous[index];
    if (loader) require.extensions[extension] = loader;
    else delete require.extensions[extension];
  });
};

/** slug検索は常に0件を返すWPを模す(存在しないコンテンツ)。 */
const emptyWp: typeof fetch = async () =>
  Response.json([], { headers: { 'X-WP-TotalPages': '1', 'X-WP-Total': '0' } });

const detailPages = [
  'person', 'company', 'franchise', 'theater-release', 'vod-release', 'seasonal-reviews',
] as const;

// グローバルfetchを置換する検証は直列に実行し、最後に必ず戻す。
test('詳細ページのgetStaticProps', async (t) => {
  const restoreAssets = stubAssetModules();
  const load = async (name: string): Promise<GetStaticProps> => {
    const mod: { getStaticProps: GetStaticProps } = await import(`../../src/pages/${name}`);
    return mod.getStaticProps;
  };

  try {
    for (const name of detailPages) {
      await t.test(`${name}: 存在しないslugは短い再検証間隔つきの404で、永続キャッシュされない`, async () => {
        globalThis.fetch = emptyWp;
        const getStaticProps = await load(`${name}/[slug]`);
        const result = await getStaticProps({ params: { slug: 'does-not-exist' }, locale: 'ja' });
        assert.deepEqual(result, { notFound: true, revalidate: REVALIDATE_NOT_FOUND });
      });

      await t.test(`${name}: slugが文字列でない場合は404`, async () => {
        globalThis.fetch = emptyWp;
        const getStaticProps = await load(`${name}/[slug]`);
        assert.deepEqual(await getStaticProps({ params: {}, locale: 'ja' }), { notFound: true });
      });
    }

    await t.test('固定ページ: 存在しない固定ページ/記事は短い再検証間隔つきの404', async () => {
      globalThis.fetch = emptyWp;
      const getStaticProps = await load('[slug]');
      const result = await getStaticProps({ params: { slug: 'does-not-exist' }, locale: 'ja' });
      assert.deepEqual(result, { notFound: true, revalidate: REVALIDATE_NOT_FOUND });
    });

    await t.test('固定ページ: 記事のslugなら正規URLへ恒久リダイレクトする', async () => {
      globalThis.fetch = async (input) => {
        const url = new URL(String(input));
        const isPages = url.pathname.endsWith('/pages');
        const post = {
          id: 1, slug: 'some-film', link: 'https://wp.example/some-film/', title: { rendered: 'Film' },
          content: { rendered: '' }, excerpt: { rendered: '' }, date: '2026-01-01T00:00:00', modified: '2026-01-01T00:00:00',
          featured_media: 0, acf: { lang: 'ja' },
          _embedded: { 'wp:term': [[{ id: 3, slug: 'anime', name: 'anime' }]] },
        };
        return Response.json(isPages ? [] : [post]);
      };
      const getStaticProps = await load('[slug]');
      const result = await getStaticProps({ params: { slug: 'some-film' }, locale: 'ja' });
      assert.ok('redirect' in result);
      if ('redirect' in result) {
        assert.ok('permanent' in result.redirect && result.redirect.permanent === true, '恒久リダイレクトではない');
        assert.match(result.redirect.destination, /anime\/some-film/);
      }
    });

    await t.test('トークン設定済みのビルドでは、WP障害を404にせず失敗させる', async () => {
      process.env.WP_SSG_BUILD = '1';
      process.env.WP_BUILD_TOKEN = 'test-only-token';
      try {
        globalThis.fetch = async () => new Response('', { status: 403 });
        for (const name of ['person', 'company', 'theater-release']) {
          const getStaticProps = await load(`${name}/[slug]`);
          await assert.rejects(
            async () => getStaticProps({ params: { slug: `strict-${name}` }, locale: 'ja' }),
            /WordPress request failed/,
            name,
          );
        }
      } finally {
        delete process.env.WP_SSG_BUILD;
        delete process.env.WP_BUILD_TOKEN;
      }
    });

    await t.test('トークン未設定・実行時のWP障害は、短い再検証間隔つきの404として後で回復できる', async () => {
      globalThis.fetch = async () => new Response('', { status: 403 });
      const getStaticProps = await load('person/[slug]');
      const result = await getStaticProps({ params: { slug: 'transient-failure' }, locale: 'ja' });
      assert.deepEqual(result, { notFound: true, revalidate: REVALIDATE_NOT_FOUND });
    });
  } finally {
    globalThis.fetch = originalFetch;
    restoreAssets();
    delete process.env.WP_SSG_BUILD;
    delete process.env.WP_BUILD_TOKEN;
  }
});
