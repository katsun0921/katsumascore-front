import assert from 'node:assert/strict';
import test from 'node:test';

import { createDevToolsStore, DEV_TOOLS_STORAGE_KEY } from '../../src/libs/devtools/devToolsStore';
import type { DevToolsStorage } from '../../src/libs/devtools/devToolsStore';
import { resolveSayoClient } from '../../src/components/features/sayo/useSayoClient/resolveSayoClient';
import {
  SAYO_DEV_KEYS,
  SAYO_MOCK_SCENARIOS,
  SAYO_MOCK_SCENARIO_IDS,
} from '../../src/components/features/sayo/mocks/sayoMockScenarios';
import { createSayoMockClient } from '../../src/components/features/sayo/mocks/sayoMockClient';
import type { SayoClient } from '../../src/types/sayo';

/** メモリ上の保存先。書き込み回数を数える */
const memoryStorage = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  const storage: DevToolsStorage & { writes: number; data: Map<string, string> } = {
    writes: 0,
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => { storage.writes += 1; data.set(key, value); },
    removeItem: (key) => { storage.writes += 1; data.delete(key); },
  };
  return storage;
};

const unusedApiClient = {} as SayoClient;

test('設定ストア: 無効（本番）のときは保存値を読まず、書かず、既定値を返す', () => {
  const storage = memoryStorage({ [DEV_TOOLS_STORAGE_KEY]: JSON.stringify({ 'sayo.dataSource': 'api' }) });
  const store = createDevToolsStore(() => storage, false);
  assert.equal(store.get('sayo.dataSource', 'mock'), 'mock');
  assert.equal(store.getChoice('sayo.dataSource', ['mock', 'api'] as const, 'mock'), 'mock');
  store.set('sayo.dataSource', 'api');
  store.reset();
  assert.equal(storage.writes, 0);
});

test('設定ストア: 有効のとき、値を保存して読み返せる', () => {
  const storage = memoryStorage();
  const store = createDevToolsStore(() => storage, true);
  assert.equal(store.get('k', 'fallback'), 'fallback');
  store.set('k', 'v');
  assert.equal(store.get('k', 'fallback'), 'v');
  assert.deepEqual(JSON.parse(storage.data.get(DEV_TOOLS_STORAGE_KEY) ?? '{}'), { k: 'v' });
  // 新しいストア（再読み込み）でも読める
  assert.equal(createDevToolsStore(() => storage, true).get('k', 'fallback'), 'v');
});

test('設定ストア: 選択肢にない保存値・壊れた保存値は既定値に戻す', () => {
  const allowed = ['a', 'b'] as const;
  const stale = createDevToolsStore(() => memoryStorage({ [DEV_TOOLS_STORAGE_KEY]: JSON.stringify({ k: 'removed' }) }), true);
  assert.equal(stale.getChoice('k', allowed, 'a'), 'a');

  for (const raw of ['{not json', '[]', 'null', '"text"', JSON.stringify({ k: 1 })]) {
    const store = createDevToolsStore(() => memoryStorage({ [DEV_TOOLS_STORAGE_KEY]: raw }), true);
    assert.equal(store.getChoice('k', allowed, 'b'), 'b', `raw=${raw}`);
  }
});

test('設定ストア: 保存先が使えなくても例外にならず、そのページの間は値を保つ', () => {
  const broken = createDevToolsStore(() => { throw new Error('denied'); }, true);
  assert.equal(broken.get('k', 'x'), 'x');
  broken.set('k', 'y');
  assert.equal(broken.get('k', 'x'), 'y');
  const none = createDevToolsStore(() => null, true);
  none.set('k', 'z');
  assert.equal(none.get('k', 'x'), 'z');
});

test('設定ストア: reset は指定キーだけ、省略時はすべて消す', () => {
  const storage = memoryStorage();
  const store = createDevToolsStore(() => storage, true);
  store.set('a', '1');
  store.set('b', '2');
  store.reset(['a']);
  assert.equal(store.get('a', 'none'), 'none');
  assert.equal(store.get('b', 'none'), '2');
  store.reset();
  assert.equal(store.get('b', 'none'), 'none');
  assert.equal(storage.data.has(DEV_TOOLS_STORAGE_KEY), false);
});

test('設定ストア: 変更を購読者へ知らせ、解除後は知らせない。refresh は保存先を読み直す', () => {
  const storage = memoryStorage();
  const store = createDevToolsStore(() => storage, true);
  let calls = 0;
  const unsubscribe = store.subscribe(() => { calls += 1; });
  store.set('k', 'v');
  assert.equal(calls, 1);
  storage.data.set(DEV_TOOLS_STORAGE_KEY, JSON.stringify({ k: 'from-other-tab' }));
  assert.equal(store.get('k', 'x'), 'v', 'refresh 前は cache の値');
  store.refresh();
  assert.equal(calls, 2);
  assert.equal(store.get('k', 'x'), 'from-other-tab');
  unsubscribe();
  store.set('k', 'w');
  assert.equal(calls, 2);
});

test('サヨのクライアント選択: 本番（無効）は設定にかかわらず本番のクライアントを返す', () => {
  const store = createDevToolsStore(() => memoryStorage({ [DEV_TOOLS_STORAGE_KEY]: JSON.stringify({ [SAYO_DEV_KEYS.dataSource]: 'mock' }) }), false);
  assert.equal(resolveSayoClient(unusedApiClient, store), unusedApiClient);
});

test('サヨのクライアント選択: 開発サーバーの既定は mock（本番のクライアントを使わない＝料金がかからない）', async () => {
  const store = createDevToolsStore(() => memoryStorage(), true);
  const client = resolveSayoClient(unusedApiClient, store);
  assert.notEqual(client, unusedApiClient);
  assert.deepEqual(await client.getSession(), { joined: true, remaining: 30 });
});

test('サヨのクライアント選択: API疎通確認が無効の間（G10まで）は、api を保存していても mock に戻す', () => {
  const store = createDevToolsStore(() => memoryStorage({ [DEV_TOOLS_STORAGE_KEY]: JSON.stringify({ [SAYO_DEV_KEYS.dataSource]: 'api' }) }), true);
  assert.notEqual(resolveSayoClient(unusedApiClient, store), unusedApiClient);
});

test('サヨのクライアント選択: シナリオの設定が mock の応答に反映される。未知のシナリオは通常に戻る', async () => {
  const pick = (scenario: string) => createDevToolsStore(() => memoryStorage({ [DEV_TOOLS_STORAGE_KEY]: JSON.stringify({ [SAYO_DEV_KEYS.scenario]: scenario }) }), true);
  assert.deepEqual(await resolveSayoClient(unusedApiClient, pick('notJoined')).getSession(), { joined: false });
  await assert.rejects(resolveSayoClient(unusedApiClient, pick('sessionError')).getSession());
  assert.deepEqual(await resolveSayoClient(unusedApiClient, pick('limitReached')).getSession(), { joined: true, remaining: 0 });
  assert.deepEqual(await resolveSayoClient(unusedApiClient, pick('no-such-scenario')).getSession(), { joined: true, remaining: 30 });
});

test('UI確認シナリオ: 会話の status を強制するシナリオは、その status と表情 sorry を返す', async () => {
  const forced = SAYO_MOCK_SCENARIO_IDS.filter((id) => 'forceMessageStatus' in SAYO_MOCK_SCENARIOS[id].options);
  assert.ok(forced.length >= 7, '会話の status を強制するシナリオが足りない');
  for (const id of forced) {
    const options = SAYO_MOCK_SCENARIOS[id].options as { forceMessageStatus: string };
    const result = await createSayoMockClient({ ...SAYO_MOCK_SCENARIOS[id].options, delayMs: 0 }).sendMessage({ message: 'テスト' });
    assert.equal(result.status, options.forceMessageStatus, id);
    assert.equal(result.expression, 'sorry', id);
  }
});

test('UI確認: 通常の返事の表情はサーバー側の値（記事あり→recommend、ネタバレ→secret、記事なし→default）', async () => {
  const client = createSayoMockClient({ delayMs: 0 });
  assert.equal((await client.sendMessage({ message: '似た作品は？', articleId: 1201 })).expression, 'recommend');
  assert.equal((await client.sendMessage({ message: '結末を教えて（ネタバレ）', articleId: 1201 })).expression, 'secret');
  assert.equal((await client.sendMessage({ message: '見どころは？', articleId: 1201 })).expression, 'default');
});

test('UI確認シナリオ: シナリオIDは重複せず、ラベルと説明が空でない', () => {
  assert.equal(new Set(SAYO_MOCK_SCENARIO_IDS).size, SAYO_MOCK_SCENARIO_IDS.length);
  for (const id of SAYO_MOCK_SCENARIO_IDS) {
    assert.ok(SAYO_MOCK_SCENARIOS[id].label.length > 0, id);
    assert.ok(SAYO_MOCK_SCENARIOS[id].description.length > 0, id);
  }
});
