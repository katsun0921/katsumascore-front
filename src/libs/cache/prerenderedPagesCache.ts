/** Next 16.3のPagesキーからOpenNextの事前生成キャッシュを参照する互換層。 */
import type { IncrementalCache } from '@opennextjs/aws/types/overrides.js';

/** Pages Routerの実行時キーだけを事前生成物のURLパスへ変換し、他の種別は変えない。 */
const prerenderedPath = (key: string): string =>
  key.match(/^\/route-cache\/PAGES\/[^/]+\/\$(\/.*)$/)?.[1] ?? key;

/**
 * 実行時の保存値を優先し、未保存のPagesだけビルド時のパスキーへフォールバックする。
 * setは元のキーを保持してISR・blocking生成を保存する。deleteは古い事前生成物も除去する。
 * nameを維持することでOpenNextのR2キャッシュ投入処理も引き続き利用できる。
 */
export const withPrerenderedPagesCache = (cache: IncrementalCache): IncrementalCache => ({
  name: cache.name,
  /** 新しい実行時データを優先し、fetch/composableには互換変換を適用しない。 */
  get: async (key, cacheType) => {
    const current = await cache.get(key, cacheType);
    if (current) return current;
    if (cacheType !== undefined && cacheType !== 'cache') return null;
    const path = prerenderedPath(key);
    if (path === key) return null;
    return cache.get(path, cacheType);
  },
  /** ISRと未生成パスの新しい値は、Nextが指定した元のキーへ保存する。 */
  set: (key, value, cacheType) => cache.set(key, value, cacheType),
  /** 削除後にビルド時の古いデータが再び返らないよう、対応するパスキーも削除する。 */
  delete: async (key) => {
    await cache.delete(key);
    const path = prerenderedPath(key);
    if (path !== key) await cache.delete(path);
  },
});
