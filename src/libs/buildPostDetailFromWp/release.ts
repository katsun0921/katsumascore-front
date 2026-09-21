/**
 * ACF グループ `release`（公開日 / 話数 / シーズン）の正規化。
 *
 * 本番の REST は未入力時に `episode_count: ""` / `release_season: false` を返すため、
 * ここで表示用の値（数値 / リンク）へ落とすか undefined にする。
 */
import { getSeasonalReviewUrl } from "@/libs/route";

/** 季節まとめハブ（`seasonal_review` CPT）への参照。 */
export type ReleaseSeason = {
  title: string;
  /** まとめページへのパス。スラッグを取得できなければ undefined（リンクにしない） */
  href?: string;
};

/**
 * `episode_count` を正の整数へ正規化する。
 * 未入力（`""`）・0以下・数値でない値は undefined を返す。
 */
export const parseEpisodeCount = (value: unknown): number | undefined => {
  const num = typeof value === "number" ? value : Number(String(value ?? "").trim());
  if (!Number.isFinite(num) || !Number.isInteger(num) || num <= 0) return undefined;
  return num;
};

/**
 * `release_season`（post_object）を表示用へ正規化する。
 *
 * ACF は未選択時に `false` を返す。`return_format: object` のため通常は
 * 投稿オブジェクトだが、環境によって ID（数値）で返ることもあるため
 * その場合はタイトルが取れないので undefined とする。
 */
export const parseReleaseSeason = (
  value: unknown,
  lang: string,
): ReleaseSeason | undefined => {
  if (value === null || value === undefined || value === false) return undefined;
  if (typeof value !== "object") return undefined;

  const record = value as Record<string, unknown>;
  const title = typeof record.post_title === "string" ? record.post_title.trim() : "";
  if (!title) return undefined;

  const slug = typeof record.post_name === "string" ? record.post_name.trim() : "";
  return slug ? { title, href: getSeasonalReviewUrl(slug, lang) } : { title };
};
