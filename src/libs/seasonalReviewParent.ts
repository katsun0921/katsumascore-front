/**
 * 季節レビュー一覧の親固定ページを、設定スラッグで解決する。
 */
import { WP_SEASONAL_REVIEW_PARENT_SLUG } from "@/config/wpContent.config";
import { getPageBySlug } from "@/libs/api/wordpress";

/** 互換: 季節レビュー親のスラッグ（`wpContent.config` と同一）。 */
export const WORDPRESS_SEASONAL_REVIEWS_PARENT_SLUG_DEFAULT = WP_SEASONAL_REVIEW_PARENT_SLUG;

/**
 * 季節レビュー親固定ページの数値 ID を返す。
 * {@link WP_SEASONAL_REVIEW_PARENT_SLUG} を `getPageBySlug` に渡して解決する。
 *
 * @param lang — Polylang 相当の言語（`ja` / `en`）。
 * @returns 親ページの `id`。取得できなければ `null`。
 */
export const resolveSeasonalReviewParentId = async (lang: "ja" | "en"): Promise<number | null> => {
  const parent = await getPageBySlug(WP_SEASONAL_REVIEW_PARENT_SLUG, lang);
  return parent?.id ?? null;
};
