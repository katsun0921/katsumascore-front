import { publicAssetUrl } from '@/libs/publicAssetUrl';

/**
 * スコア値に基づいてランキングアイコンのパスを返す
 * 参照: katsumascore_wordpress_theme/inc/get-ranking-icon.php
 *
 * スコア範囲 (1〜5):
 *   1.0 ≤ value < 2.0  → C (icon-rank-c.png)
 *   2.0 ≤ value < 3.0  → B (icon-rank-b.png)
 *   3.0 ≤ value < 4.0  → A (icon-rank-a.png)
 *   4.0 ≤ value < 4.5  → S (icon-rank-s.png)
 *   4.5 ≤ value ≤ 5.0  → SS (icon-rank-ss.png)
 */

export type RankLabel = 'C' | 'B' | 'A' | 'S' | 'SS'

type RankRange = {
  min: number
  max: number
  icon: string
  label: RankLabel
}

const RANK_MAP: RankRange[] = [
  { min: 1.0, max: 2.0, icon: 'icon-rank-c.png', label: 'C' },
  { min: 2.0, max: 3.0, icon: 'icon-rank-b.png', label: 'B' },
  { min: 3.0, max: 4.0, icon: 'icon-rank-a.png', label: 'A' },
  { min: 4.0, max: 4.5, icon: 'icon-rank-s.png', label: 'S' },
  { min: 4.5, max: 5.0, icon: 'icon-rank-ss.png', label: 'SS' },
];

const ICONS_BASE_PATH = '/images/icons/';

export const getRankingIcon = (value: number): { src: string; label: RankLabel } | null => {
  for (const range of RANK_MAP) {
    if (value >= range.min && value < range.max) {
      return { src: publicAssetUrl(`${ICONS_BASE_PATH}${range.icon}`), label: range.label };
    }
  }
  // 最大値 5.0 の場合
  if (value === 5.0) {
    return { src: publicAssetUrl(`${ICONS_BASE_PATH}icon-rank-ss.png`), label: 'SS' };
  }
  return null;
};

type RankColorClasses = { text: string; bg: string }

/** ScoreWithRank のランク別カラークラス（text / bg）。範囲外は本文色。 */
export const getRankScoreColorClasses = (rank: RankLabel | null): RankColorClasses => {
  if (!rank) {
    return {
      text: 'text-color-primary',
      bg: 'bg-color-primary',
    };
  }
  const map: Record<RankLabel, RankColorClasses> = {
    C:  { text: 'text-score-rank-low',  bg: 'bg-score-rank-low'  },
    B:  { text: 'text-score-rank-low',  bg: 'bg-score-rank-low'  },
    A:  { text: 'text-score-rank-mid',  bg: 'bg-score-rank-mid'  },
    S:  { text: 'text-score-rank-high', bg: 'bg-score-rank-high' },
    SS: { text: 'text-score-accent',    bg: 'bg-score-accent'    },
  };
  return map[rank];
};
