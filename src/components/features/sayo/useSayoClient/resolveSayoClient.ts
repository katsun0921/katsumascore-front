import type { SayoClient } from '@/types/sayo';
import { devToolsStore } from '@/libs/devtools';
import type { DevToolsStore } from '@/libs/devtools';
import { createSayoMockClient } from '@/components/features/sayo/mocks/sayoMockClient';
import {
  SAYO_API_MODE_ENABLED,
  SAYO_DATA_SOURCES,
  SAYO_DEV_KEYS,
  SAYO_MOCK_SCENARIOS,
  SAYO_MOCK_SCENARIO_IDS,
} from '@/components/features/sayo/mocks/sayoMockScenarios';

/**
 * 使う SayoClient を決める。
 * - 本番（開発者ツールが無効）：常に `apiClient`
 * - 開発サーバー：開発者ツールの設定に従う。既定は mock（通信せず料金がかからない）。
 *   `api` は、有効にした（`SAYO_API_MODE_ENABLED`。G10 で true にする）ときだけ。無効の間は mock に戻す
 * @param apiClient 本番の SayoClient（G4 の `src/libs/api/sayoChat.ts`）
 * @param store 設定ストア（テストで差し替える）
 */
export const resolveSayoClient = (apiClient: SayoClient, store: DevToolsStore = devToolsStore): SayoClient => {
  if (!store.enabled) return apiClient;
  const source = store.getChoice(SAYO_DEV_KEYS.dataSource, SAYO_DATA_SOURCES, 'mock');
  if (source === 'api' && SAYO_API_MODE_ENABLED) return apiClient;
  const scenario = store.getChoice(SAYO_DEV_KEYS.scenario, SAYO_MOCK_SCENARIO_IDS, 'normal');
  return createSayoMockClient(SAYO_MOCK_SCENARIOS[scenario].options);
};
