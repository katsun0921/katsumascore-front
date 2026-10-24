import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createWpResponseCache } from '../../src/libs/api/wordpress/responseCache';
import { withPrerenderedPagesCache } from '../../src/libs/cache/prerenderedPagesCache';

/** 少ないバイト数でキャッシュ上限と取得共有を検証するための応答を作る。 */
const buffered = (text: string) => ({
  status: 200, statusText: 'OK', headers: [] as [string, string][], body: new TextEncoder().encode(text).buffer,
});

test('WPキャッシュは上限以内だけ保持し、超過時も取得中は共有する', async () => {
  const cache = createWpResponseCache(4);
  let requests = 0;
  const small = async () => { requests += 1; return buffered('1234'); };
  await Promise.all([cache.getOrFetch('small', small), cache.getOrFetch('small', small)]);
  await cache.getOrFetch('small', small);
  assert.equal(requests, 1);
  const large = async () => { requests += 1; return buffered('56789'); };
  await Promise.all([cache.getOrFetch('large', large), cache.getOrFetch('large', large)]);
  assert.equal(requests, 2);
  await cache.getOrFetch('large', large);
  assert.equal(requests, 3);
  await cache.getOrFetch('small', small);
  assert.equal(requests, 3);
});

test('失敗したWP応答はキャッシュせず、次の取得で回復できる', async () => {
  const cache = createWpResponseCache();
  await assert.rejects(cache.getOrFetch('retry', async () => { throw new Error('temporary'); }), /temporary/);
  const result = await cache.getOrFetch('retry', async () => buffered('recovered'));
  assert.equal(new TextDecoder().decode(result.body), 'recovered');
});

test('実R2実装で事前生成キーの不一致を再現し、ISR・blockingの書き込みと削除を維持する', async () => {
  const contextSymbol = Symbol.for('__cloudflare-context__');
  const previousContext: unknown = Reflect.get(globalThis, contextSymbol);
  const previousBuildId = process.env.OPEN_NEXT_BUILD_ID;
  const stored = new Map<string, { value: unknown; uploaded: Date }>();
  const uploaded = new Date('2026-10-22T19:17:00Z');
  const calls: string[] = [];
  Reflect.set(globalThis, contextSymbol, {
    env: {
      NEXT_INC_CACHE_R2_BUCKET: {
        get: async (key: string) => {
          calls.push(key);
          const entry = stored.get(key);
          return entry ? { json: async () => entry.value, uploaded: entry.uploaded } : null;
        },
        put: async (key: string, value: string) => { stored.set(key, { value: JSON.parse(value), uploaded }); },
        delete: async (key: string) => { stored.delete(key); },
      },
    },
  });
  process.env.OPEN_NEXT_BUILD_ID = 'ssg-cache-test';
  try {
    const { default: r2 } = await import('@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache');
    const path = '/ja/movie/test';
    const key = `/route-cache/PAGES/variant-1/$${path}`;
    const seed = { type: 'page' as const, html: '<p>seed</p>', json: { revision: 1 } };
    await r2.set(path, seed, 'cache');
    assert.equal(stored.size, 1);
    assert.equal(await r2.get(key, 'cache'), null, '標準R2では実行時キーが事前生成キーと一致しない');
    const cache = withPrerenderedPagesCache(r2);
    assert.equal(cache.name, r2.name, 'OpenNextのR2投入対象であり続ける');
    const initial = await cache.get(key, 'cache');
    assert.deepEqual(initial?.value, seed);
    assert.equal(initial?.lastModified, uploaded.getTime(), '事前生成日時を維持してISRの鮮度を変えない');
    const updated = { ...seed, html: '<p>updated by ISR</p>', json: { revision: 2 } };
    await cache.set(key, updated, 'cache');
    assert.deepEqual((await cache.get(key, 'cache'))?.value, updated);
    assert.deepEqual((await r2.get(path, 'cache'))?.value, seed, '実行時の書き込みは元のキーを使う');
    const newKey = '/route-cache/PAGES/new-variant/$/en/person/new-person';
    assert.equal(await cache.get(newKey, 'cache'), null);
    await cache.set(newKey, updated, 'cache');
    assert.deepEqual((await cache.get(newKey, 'cache'))?.value, updated, 'blocking生成した値を保存できる');
    calls.length = 0;
    assert.equal(await cache.get(key, 'fetch'), null);
    assert.equal(calls.length, 1, 'fetchキーはパスへ変換しない');
    calls.length = 0;
    assert.equal(await cache.get('/route-cache/APP_PAGE/hash/$/ja/movie/test', 'cache'), null);
    assert.equal(calls.length, 1, 'App Routerキーも変換しない');
    await cache.delete(key);
    assert.equal(await r2.get(path, 'cache'), null);
    assert.equal(await cache.get(key, 'cache'), null, '削除後に古い事前生成物を再び返さない');
  } finally {
    if (previousContext === undefined) Reflect.deleteProperty(globalThis, contextSymbol);
    else Reflect.set(globalThis, contextSymbol, previousContext);
    if (previousBuildId === undefined) delete process.env.OPEN_NEXT_BUILD_ID;
    else process.env.OPEN_NEXT_BUILD_ID = previousBuildId;
  }
});
