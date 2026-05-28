/**
 * VOD サービスの共通定義。
 * マスターデータは `@/config/vod.config` で一元管理している。
 * このファイルは後方互換エクスポートと派生マップのみを提供する。
 */
export type { VodService } from '@/config/vod.config';
export { VOD_CONFIG } from '@/config/vod.config';

import { VOD_CONFIG } from '@/config/vod.config';
import type { VodService } from '@/config/vod.config';

/** CSS変数（背景色）。 `VOD_CONFIG[service].colorVar` の派生マップ。 */
export const VOD_COLOR_VAR: Record<VodService, string> = Object.fromEntries(
  (Object.keys(VOD_CONFIG) as VodService[]).map((k) => [k, VOD_CONFIG[k].colorVar]),
) as Record<VodService, string>;

/** Tailwind border-top クラス（VodItem 用）。 `VOD_CONFIG[service].borderClass` の派生マップ。 */
export const VOD_BORDER_CLASS: Record<VodService, string> = Object.fromEntries(
  (Object.keys(VOD_CONFIG) as VodService[]).map((k) => [k, VOD_CONFIG[k].borderClass]),
) as Record<VodService, string>;
