import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import {
  SAYO_CONSENT_KEY, SAYO_CONSENT_VERSION, readSayoConsent, resetSayoConsentMemory, saveSayoConsent, subscribeSayoConsent,
} from '../../src/libs/sayoConsent';
import type { SayoConsentStorage } from '../../src/libs/sayoConsent';

/** localStorage の代わり（Map で持つ） */
const createStorage = (): SayoConsentStorage & { map: Map<string, string> } => {
  const map = new Map<string, string>();
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => { map.set(k, v); } };
};

/** 読み書きのたびに例外を投げる入れ物（サイトデータをブロックしたブラウザ） */
const brokenStorage: SayoConsentStorage = {
  getItem: () => { throw new Error('denied'); },
  setItem: () => { throw new Error('denied'); },
};

beforeEach(() => resetSayoConsentMemory());

test('未同意なら false、同意を保存すると true（版だけを保存する）', () => {
  const storage = createStorage();
  assert.equal(readSayoConsent(storage), false);
  saveSayoConsent(storage);
  assert.equal(readSayoConsent(storage), true);
  assert.deepEqual([...storage.map.entries()], [[SAYO_CONSENT_KEY, SAYO_CONSENT_VERSION]]);
});

test('保存済みの値が別の版なら未同意として扱う（規約を変えたら出し直す）', () => {
  const storage = createStorage();
  storage.setItem(SAYO_CONSENT_KEY, '2000-01-01');
  assert.equal(readSayoConsent(storage), false);
  storage.setItem(SAYO_CONSENT_KEY, 'true');
  assert.equal(readSayoConsent(storage), false);
});

test('localStorage が使えなくても、同意したページの間はメモリで同意済みにする', () => {
  assert.equal(readSayoConsent(brokenStorage), false);
  assert.doesNotThrow(() => saveSayoConsent(brokenStorage));
  assert.equal(readSayoConsent(brokenStorage), true);
  assert.equal(readSayoConsent(null), true);
});

test('同意を保存すると購読者へ知らせ、購読をやめたら知らせない', () => {
  let calls = 0;
  const stop = subscribeSayoConsent(() => { calls += 1; });
  saveSayoConsent(createStorage());
  assert.equal(calls, 1);
  stop();
  saveSayoConsent(createStorage());
  assert.equal(calls, 1);
});
