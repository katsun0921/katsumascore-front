/**
 * サヨ（AIチャット）の利用規約への同意を、ブラウザの localStorage に保存する。
 * 保存するのは「同意した規約の版」だけで、質問・回答・合言葉・日時などは保存しない。
 * 規約の文面を変えたら SAYO_CONSENT_VERSION を上げる（古い版の同意は無効になり、もう一度同意画面を出す）。
 * localStorage が使えないブラウザ（プライベートモードの一部など）では、ページを開いている間だけメモリで覚える。
 */

/** localStorage のキー */
export const SAYO_CONSENT_KEY = 'katsumascore:sayo-consent';

/**
 * いまの規約の版。文面を変えたら上げる。
 * ai-chat の参加専用ページ（/api/chat/join）も同じキーにこの版を書くので、変えるときは ai-chat 側も同時に変える
 */
export const SAYO_CONSENT_VERSION = '2026-11-24';

/** localStorage と同じ形の最小の入れ物（テストで差し替えるため） */
export type SayoConsentStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** localStorage が使えないときの代わり（ページを開いている間だけ） */
let memoryVersion: string | null = null;
const listeners = new Set<() => void>();

/**
 * 使える localStorage を返す。サーバー側・アクセスが拒否されるブラウザでは null
 */
const defaultStorage = (): SayoConsentStorage | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    // Cookie・サイトデータをブロックしていると、参照だけで例外になる
    return null;
  }
};

/**
 * いまの版に同意済みかを返す。
 * @param storage 読む先。省略時は localStorage
 * @returns 同意済みなら true。未同意・古い版・読めないときは false（メモリに同意があれば true）
 */
export const readSayoConsent = (storage: SayoConsentStorage | null = defaultStorage()): boolean => {
  if (memoryVersion === SAYO_CONSENT_VERSION) return true;
  if (!storage) return false;
  try {
    return storage.getItem(SAYO_CONSENT_KEY) === SAYO_CONSENT_VERSION;
  } catch {
    return false;
  }
};

/**
 * いまの版への同意を保存し、購読している画面へ知らせる。
 * 保存に失敗しても、ページを開いている間はメモリで同意済みとして扱う（同意した人を止めないため）。
 * @param storage 書く先。省略時は localStorage
 */
export const saveSayoConsent = (storage: SayoConsentStorage | null = defaultStorage()): void => {
  memoryVersion = SAYO_CONSENT_VERSION;
  try {
    storage?.setItem(SAYO_CONSENT_KEY, SAYO_CONSENT_VERSION);
  } catch {
    // 容量超過・書き込み禁止。メモリの同意だけで続ける
  }
  listeners.forEach((fn) => fn());
};

/**
 * 同意の変化を購読する（useSyncExternalStore 用）。別のタブで同意したときも storage イベントで知らせる。
 * @param onChange 変化したときに呼ぶ関数
 * @returns 購読をやめる関数
 */
export const subscribeSayoConsent = (onChange: () => void): (() => void) => {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => { if (e.key === SAYO_CONSENT_KEY) onChange(); };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
};

/**
 * テスト・Storybook 用：メモリの同意を消す（localStorage は呼び出し側で消す）
 */
export const resetSayoConsentMemory = (): void => {
  memoryVersion = null;
  listeners.forEach((fn) => fn());
};
