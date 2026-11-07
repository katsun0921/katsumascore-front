import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import type { GetStaticProps } from 'next';
import { createElement, Fragment, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HeadManagerContext } from 'next/dist/shared/lib/head-manager-context.shared-runtime';
import { normalizePageContent } from '../../src/libs/api/wordpress/transform';
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

    await t.test('固定ページ: ACFの説明をSSGからheadまで渡し、タイトルとSEOタグを出力する', async () => {
      globalThis.fetch = async () => Response.json([{
        id: 19769, slug: 'featured-seo', title: { rendered: '特集 &amp; 解説' },
        content: { rendered: '<p>本文</p>' }, excerpt: { rendered: '<p>抜粋</p>' },
        acf: { description: 'ACFの説明' },
      }]);
      const { default: WPPage, getStaticProps } = await import('../../src/pages/[slug]');
      const result = await getStaticProps({ params: { slug: 'featured-seo' }, locale: 'ja' });
      assert.ok('props' in result);
      if (!('props' in result)) return;
      const props = await result.props;
      assert.equal(props.description, 'ACFの説明');
      assert.equal('revalidate' in result, false);
      let head: ReactNode[] = [];
      renderToStaticMarkup(createElement(HeadManagerContext.Provider, {
        value: { mountedInstances: new Set(), updateHead: (elements: ReactNode[]) => { head = elements; } },
      }, WPPage(props).props.children[0]));
      const markup = renderToStaticMarkup(createElement(Fragment, null, ...head));
      assert.match(markup, /<title[^>]*>特集 &amp; 解説 \| KatsumaScore<\/title>/);
      assert.match(markup, /name="description" content="ACFの説明"/);
      assert.match(markup, /property="og:description" content="ACFの説明"/);
      assert.match(markup, /name="twitter:description" content="ACFの説明"/);
      assert.match(markup, /rel="canonical" href="https:\/\/katsumascore.blog\/ja\/featured-seo"/);
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

    await t.test('特集子ページ: 旧URLは301、親子URLはSEO付きSSG、別階層からも正規URLに寄せる', async () => {
      const pages = [
        { id: 19766, slug: 'featured-article', parent: 0, title: { rendered: '特集' }, content: { rendered: '' } },
        { id: 19769, slug: 'lotr', parent: 19766, title: { rendered: '三部作' }, content: { rendered: '<p>本文</p>' }, acf: { description: '説明' } },
      ];
      globalThis.fetch = async (input) => {
        const slug = new URL(String(input)).searchParams.get('slug');
        const result = slug ? pages.filter((page) => page.slug === slug) : pages;
        return Response.json(result, { headers: { 'X-WP-TotalPages': '1', 'X-WP-Total': String(result.length) } });
      };
      const { getStaticProps } = await import('../../src/pages/[slug]');
      const redirect = { redirect: { destination: '/ja/featured-article/lotr', statusCode: 301 } };
      assert.deepEqual(await getStaticProps({ params: { slug: 'lotr' }, locale: 'ja' }), redirect);
      assert.deepEqual(await getStaticProps({ params: { pagePath: ['wrong-parent', 'lotr'] }, locale: 'ja' }), redirect);
      const result = await getStaticProps({ params: { pagePath: ['featured-article', 'lotr'] }, locale: 'ja' });
      assert.ok('props' in result);
      if (!('props' in result)) return;
      const props = await result.props;
      assert.equal(props.slug, 'featured-article/lotr');
      assert.equal(props.description, '説明');
      assert.equal('revalidate' in result, false);
      assert.deepEqual(await getStaticProps({ params: { slug: 'lotr' }, locale: 'en' }), {
        redirect: { destination: '/en/featured-article/lotr', statusCode: 301 },
      });
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

test('固定ページ: 未設定・不正な補助フィールドは抜粋、本文、タイトルで補完する', () => {
  const page = { title: { rendered: '特集' }, content: { rendered: '<p>本文</p>' } };
  for (const description of [undefined, null, false, '', [], 123]) {
    assert.equal(normalizePageContent({ ...page, excerpt: { rendered: '<p>抜粋</p>' }, acf: { description } }).description, '抜粋');
  }
  for (const acf of [undefined, null, false, []]) {
    assert.equal(normalizePageContent({ ...page, acf }).description, '本文');
  }
  assert.equal(normalizePageContent({ title: page.title }).description, '特集');
  assert.equal(normalizePageContent({ ...page, content: { rendered: 'あ'.repeat(200) } }).description.length, 160);
});
