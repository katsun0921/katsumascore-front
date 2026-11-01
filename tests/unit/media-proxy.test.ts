import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { rewriteMediaUrls, toUploadsPath } from '../../src/libs/api/wordpress/mediaUrl';
import { wpFetch } from '../../src/libs/api/wordpress/transport';
import type { NextApiRequest, NextApiResponse } from 'next';
import mediaHandler from '../../src/pages/api/media/[...path]';

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

/** 画像APIのステータス・ヘッダー・本文を記録する最小限の応答オブジェクト。 */
const callMediaHandler = async (method = 'GET') => {
  const headers = new Headers();
  const result = { status: 0, body: undefined as unknown };
  const response = {
    setHeader: (name: string, value: string) => { headers.set(name, value); return response; },
    status: (status: number) => { result.status = status; return response; },
    end: () => response,
    send: (body: unknown) => { result.body = body; return response; },
  };
  await mediaHandler(
    { method, query: { path: ['2026', '09', 'a.webp'] } } as unknown as NextApiRequest,
    response as unknown as NextApiResponse,
  );
  return { headers, ...result };
};

test('画像API: 本文取得中の切断はキャッシュしない502を返す', async () => {
  process.env.WP_API_URL = `${ORIGIN}/wp-json/wp/v2`;
  globalThis.fetch = async () => new Response(new ReadableStream({
    start: (controller) => controller.error(new Error('upstream body reset')),
  }), { headers: { 'content-type': 'image/webp' } });
  const result = await callMediaHandler();
  assert.equal(result.status, 502);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.equal(result.headers.has('content-type'), false);
  assert.equal(result.body, undefined);
});

test('画像API: 取得失敗・非画像・404もキャッシュしない', async () => {
  process.env.WP_API_URL = `${ORIGIN}/wp-json/wp/v2`;
  const cases = [
    { fetch: async (): Promise<Response> => { throw new Error('upstream timeout'); }, status: 502 },
    { fetch: async () => new Response(null, { status: 403 }), status: 502 },
    { fetch: async () => new Response('not an image', { headers: { 'content-type': 'text/html' } }), status: 502 },
    { fetch: async () => new Response(null, { status: 404 }), status: 404 },
  ];
  for (const scenario of cases) {
    globalThis.fetch = scenario.fetch;
    const result = await callMediaHandler();
    assert.equal(result.status, scenario.status);
    assert.equal(result.headers.get('cache-control'), 'no-store');
  }
});

test('画像API: GET・HEADの成功時は画像用のキャッシュ設定を返す', async () => {
  process.env.WP_API_URL = `${ORIGIN}/wp-json/wp/v2`;
  const bytes = Buffer.from('image bytes');
  globalThis.fetch = async () => new Response(bytes, { headers: { 'content-type': 'image/webp' } });
  const get = await callMediaHandler();
  assert.equal(get.status, 200);
  assert.equal(get.headers.get('content-type'), 'image/webp');
  assert.match(get.headers.get('cache-control') ?? '', /^public, max-age=3600, s-maxage=86400/);
  assert.deepEqual(get.body, bytes);
  const head = await callMediaHandler('HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('cache-control'), get.headers.get('cache-control'));
  assert.equal(head.body, undefined);
});
