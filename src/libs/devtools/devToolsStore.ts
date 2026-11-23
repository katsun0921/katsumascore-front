/**
 * 開発者ツール（ローカル確認用）の設定ストア。
 *
 * - 開発サーバー（`NODE_ENV === 'development'`）のときだけ有効。本番ビルドでは、保存値を読まず・書かず、常に既定値を返す
 * - 値は文字列の組（キー → 選んだ値）。`localStorage` に保存し、別タブの変更も拾う
 * - 選択肢は呼び出し側が渡し、保存値が選択肢にないとき（選択肢を消した後の古い値など）は既定値に戻す
 * - サヨのデータ源（mock／API）、画面のABテストなど、機能ごとにキーを分けて使う（例: `sayo.dataSource`、`ab.homeLayout`）
 *
 * 合言葉・鍵・トークンなどの秘密値は、ここに保存しない。
 */

/** 保存先。`localStorage` と同じ形（テストでは差し替える） */
export type DevToolsStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type DevToolsStore = {
  /** 開発者ツールが有効か。false のとき `get*` は常に既定値、`set`・`reset` は何もしない */
  enabled: boolean;
  /** 保存値を返す。無い・無効なときは `fallback` */
  get: (key: string, fallback: string) => string;
  /** 選択肢の中にある保存値だけ返す。無い・選択肢にない・無効なときは `fallback` */
  getChoice: <T extends string>(key: string, allowed: readonly T[], fallback: T) => T;
  /** 値を保存し、購読者へ知らせる */
  set: (key: string, value: string) => void;
  /** 指定したキー（省略時はすべて）の保存値を消す */
  reset: (keys?: readonly string[]) => void;
  /** 変更の購読（`useSyncExternalStore` 用）。解除関数を返す */
  subscribe: (listener: () => void) => () => void;
  /** 保存先を読み直す（別タブの変更を取り込むとき） */
  refresh: () => void;
};

/** `localStorage` に使うキー */
export const DEV_TOOLS_STORAGE_KEY = 'katsumascore:devtools';

/**
 * 保存された JSON を「文字列から文字列への辞書」に直す。形が違うものは捨てる
 * @param raw 保存されていた文字列（無ければ null）
 */
const parseSettings = (raw: string | null): Record<string, string> => {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
  } catch {
    return {};
  }
};

/**
 * 設定ストアを作る
 * @param getStorage 保存先を返す関数。使えないとき（SSR・権限なし）は null を返す
 * @param enabled 有効にするか。false のときは保存値を読み書きしない
 */
export const createDevToolsStore = (getStorage: () => DevToolsStorage | null, enabled: boolean): DevToolsStore => {
  const listeners = new Set<() => void>();
  let cache: Record<string, string> | null = null;

  const load = (): Record<string, string> => {
    if (cache) return cache;
    try {
      cache = parseSettings(getStorage()?.getItem(DEV_TOOLS_STORAGE_KEY) ?? null);
    } catch {
      cache = {};
    }
    return cache;
  };

  const persist = (next: Record<string, string>) => {
    cache = next;
    try {
      const storage = getStorage();
      if (!storage) return;
      if (Object.keys(next).length === 0) storage.removeItem(DEV_TOOLS_STORAGE_KEY);
      else storage.setItem(DEV_TOOLS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 保存できなくても、このページを開いている間は cache の値で動く
    }
  };

  const notify = () => listeners.forEach((listener) => listener());

  const get = (key: string, fallback: string): string => (enabled ? load()[key] ?? fallback : fallback);

  return {
    enabled,
    get,
    getChoice: (key, allowed, fallback) => {
      const value = get(key, fallback);
      return allowed.find((candidate) => candidate === value) ?? fallback;
    },
    set: (key, value) => {
      if (!enabled) return;
      persist({ ...load(), [key]: value });
      notify();
    },
    reset: (keys) => {
      if (!enabled) return;
      const next = keys ? Object.fromEntries(Object.entries(load()).filter(([key]) => !keys.includes(key))) : {};
      persist(next);
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    refresh: () => {
      cache = null;
      notify();
    },
  };
};

/** ブラウザの `localStorage`。使えない（SSR・権限なし）ときは null */
const browserStorage = (): DevToolsStorage | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
};

/** アプリ全体で使う設定ストア。開発サーバーでだけ有効 */
export const devToolsStore: DevToolsStore = createDevToolsStore(browserStorage, process.env.NODE_ENV === 'development');

// 別タブでの変更を取り込む（ブラウザだけ）
if (typeof window !== 'undefined' && devToolsStore.enabled) {
  window.addEventListener('storage', (e) => {
    if (e.key === DEV_TOOLS_STORAGE_KEY || e.key === null) devToolsStore.refresh();
  });
}
