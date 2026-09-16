/**
 * 作品のレーティング（映倫＝映画倫理機構の年齢区分）。
 *
 * WordPress 側は ACF `rating`（`Post 基本情報` グループの select）に
 * `g` / `pg12` / `r15` / `r18` のスラッグで保存する。日本語・英語の表示ラベルは
 * データに持たせず、フロント側（`RatingBadge` の i18n）で出し分ける。
 */
export const RATING_VALUES = ["g", "pg12", "r15", "r18"] as const;

export type TRating = (typeof RATING_VALUES)[number];

const RATING_SET = new Set<string>(RATING_VALUES);

/**
 * ACF の値をレーティングのスラッグへ正規化する。
 *
 * 記号・空白つきの表記ゆれ（`PG-12` / `R15+` / `R18＋`）も内部スラッグへ寄せ、
 * 未設定（`""` / `false` / `null`）や想定外の値は `undefined` を返す。
 */
export const parseRating = (value: unknown): TRating | undefined => {
  if (typeof value !== "string") return undefined;

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[-_\s+＋]/g, "");

  return RATING_SET.has(normalized) ? (normalized as TRating) : undefined;
};
