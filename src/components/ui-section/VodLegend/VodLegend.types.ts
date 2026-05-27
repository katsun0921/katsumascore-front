import type { VodService } from '@/libs/vod';

export type VodLegendProps = {
  services: VodService[];
  className?: string;
  /** バッジ文字色テーマ。'light' = #fff（TOPページ用）/ 'dark' = #000（その他ページ用）。デフォルトは 'dark' */
  badgeColor?: 'light' | 'dark';
};
