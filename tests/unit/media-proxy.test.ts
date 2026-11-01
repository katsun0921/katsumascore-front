import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { rewriteMediaUrls, toUploadsPath } from '../../src/libs/api/wordpress/mediaUrl';
import { wpFetch } from '../../src/libs/api/wordpress/transport';

const ORIGIN = 'https://cms.example.test';
const MEDIA = 'https://site.example.test/media/';

test('画像URLを /media/ へ書き換える（通常・PHPの \\/ エスケープ・HTML本文）', () => {
  const plain = `{"source_url":"${ORIGIN}/wp-content/uploads/2026/09/a.webp"}`;
  const escaped = `{"source_url":"https:\\/\\/cms.example.test\\/wp-content\\/uploads\\/2026\\/09\\/a.webp"}`;
  const html = `{"content":"<img src=\\"${ORIGIN}/wp-content/uploads/b.png\\">"}`;
  assert.equal(rewriteMediaUrls(plain, ORIGIN, MEDIA), '{"source_url":"https://site.example.test/media/2026/09/a.webp"}');
  const rewritten = rewriteMediaUrls(escaped, ORIGIN, MEDIA);
  assert.equal(JSON.parse(rewritten).source_url, 'https://site.example.test/media/2026/09/a.webp');
  assert.equal(JSON.parse(rewriteMediaUrls(html, ORIGIN, MEDIA)).content, '<img src="https://site.example.test/media/b.png">');
});

test('uploads 以外のURL・別オリジンは書き換えない', () => {
  const text = `{"link":"${ORIGIN}/ja/movie/x","other":"https://example.com/wp-content/uploads/a.webp"}`;
  assert.equal(rewriteMediaUrls(text, ORIGIN, MEDIA), text);
});

test('toUploadsPath は安全なパスと画像拡張子だけを通す', () => {
  assert.equal(toUploadsPath(['2026', '09', 'The-Odyssey-Poster.webp']), '2026/09/The-Odyssey-Poster.webp');
  assert.equal(toUploadsPath(['..', 'wp-config.php']), null);
  assert.equal(toUploadsPath(['2026', '..', 'a.webp']), null);
  assert.equal(toUploadsPath(['2026', 'a.php']), null);
  assert.equal(toUploadsPath(['2026', 'a.svg']), null);
  assert.equal(toUploadsPath(['a b', 'c.webp']), null);
  assert.equal(toUploadsPath([]), null);
});

const saved = { fetch: globalThis.fetch, api: process.env.WP_API_URL, secret: process.env.WP_ORIGIN_SECRET, site: process.env.NEXT_PUBLIC_SITE_URL, build: process.env.WP_SSG_BUILD };
afterEach(() => {
  globalThis.fetch = saved.fetch;
  const restore = (key: string, value: string | undefined) => { if (value === undefined) delete process.env[key]; else process.env[key] = value; };
  restore('WP_API_URL', saved.api);
  restore('WP_ORIGIN_SECRET', saved.secret);
  restore('NEXT_PUBLIC_SITE_URL', saved.site);
  restore('WP_SSG_BUILD', saved.build);
});

/** 受け取ったヘッダーを記録しつつ、画像URL入りのJSONを返すfetchに差し替える。 */
const mockFetch = (seen: Headers[]) => {
  globalThis.fetch = (async (_input: unknown, init?: RequestInit) => {
    seen.push(new Headers(init?.headers));
    return new Response(`[{"source_url":"${ORIGIN}/wp-content/uploads/a.webp"}]`, { headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
};

test('実行時: 秘密ヘッダーを付け、応答の画像URLを /media/ へ書き換える', async () => {
  process.env.WP_API_URL = `${ORIGIN}/wp-json/wp/v2`;
  process.env.WP_ORIGIN_SECRET = 'secret-value';
  process.env.NEXT_PUBLIC_SITE_URL = 'https://site.example.test';
  delete process.env.WP_SSG_BUILD;
  const seen: Headers[] = [];
  mockFetch(seen);
  const response = await wpFetch(`${ORIGIN}/wp-json/wp/v2/posts`);
  assert.equal(seen[0].get('x-origin-secret'), 'secret-value');
  assert.deepEqual(await response.json(), [{ source_url: 'https://site.example.test/media/a.webp' }]);
});

test('WP_ORIGIN_SECRET 未設定なら秘密ヘッダーを付けない', async () => {
  process.env.WP_API_URL = `${ORIGIN}/wp-json/wp/v2`;
  delete process.env.WP_ORIGIN_SECRET;
  delete process.env.WP_SSG_BUILD;
  const seen: Headers[] = [];
  mockFetch(seen);
  await wpFetch(`${ORIGIN}/wp-json/wp/v2/posts`);
  assert.equal(seen[0].has('x-origin-secret'), false);
});

test('ビルド時: 秘密ヘッダーを付け、バッファ済み応答も書き換える', async () => {
  process.env.WP_API_URL = `${ORIGIN}/wp-json/wp/v2`;
  process.env.WP_ORIGIN_SECRET = 'secret-value';
  process.env.NEXT_PUBLIC_SITE_URL = 'https://site.example.test';
  process.env.WP_SSG_BUILD = '1';
  const seen: Headers[] = [];
  mockFetch(seen);
  const response = await wpFetch(`${ORIGIN}/wp-json/wp/v2/posts?unique=build-rewrite`);
  assert.equal(seen[0].get('x-origin-secret'), 'secret-value');
  assert.deepEqual(await response.json(), [{ source_url: 'https://site.example.test/media/a.webp' }]);
});
