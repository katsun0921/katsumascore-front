/**
 * 季節まとめ一覧（CPT + 移行前の固定ページ）の組み立て。
 *
 * 一覧ページ（`/seasonal-reviews`・`/seasonal-anime-and-dramas-reviews`）と
 * TOP の特集枠が同じ並び順・同じ統合ルールを共有するため、ページではなく
 * ここに置く。
 */
import { getChildPages, getSeasonalReviews, normalizePageContent } from "@/libs/api/wordpress";
import { normalizeSeasonalReview, sortSeasonalReviews } from "@/libs/seasonalReview";
import { resolveSeasonalReviewParentId } from "@/libs/seasonalReviewParent";
import type { Post } from "@/types/post";

/** 季節まとめ一覧の公開パス（CPT 移行後の正）。 */
export const SEASONAL_REVIEWS_BASE_PATH = "/seasonal-reviews";

/** 移行前の固定ページ時代の公開パス。旧URLを維持するために残す。 */
export const WORDPRESS_SEASONAL_REVIEWS_BASE_PATH = "/seasonal-anime-and-dramas-reviews";

export type SeasonalIndexProps = {
  items: Post[];
  locale: string;
};

/** 固定ページの並び替えに使う日付。更新日があればそれを優先する。 */
const pageSortDate = (page: { modified?: string; date: string }): string => page.modified ?? page.date;

/** `_embed` で返るアイキャッチ画像のURLを安全に取り出す。 */
const pageFeaturedImage = (page: unknown): string | null => {
  if (page === null || typeof page !== "object") return null;
  const embedded = (page as { _embedded?: unknown })._embedded;
  if (embedded === null || typeof embedded !== "object") return null;
  const featuredMedia = (embedded as { "wp:featuredmedia"?: unknown })["wp:featuredmedia"];
  if (!Array.isArray(featuredMedia)) return null;
  const firstMedia = featuredMedia[0];
  if (firstMedia === null || typeof firstMedia !== "object") return null;
  const sourceUrl = (firstMedia as { source_url?: unknown }).source_url;
  return typeof sourceUrl === "string" ? sourceUrl : null;
};

/**
 * 移行前の固定ページ（親ページの子）から一覧を組み立てる。
 * CPT `seasonal_review` へ移行途中のフォールバック。移行完了後に削除する。
 */
const buildItemsFromPages = async (lang: "ja" | "en", basePath: string): Promise<Post[]> => {
  const parentId = await resolveSeasonalReviewParentId();
  if (!parentId) return [];
  return [...(await getChildPages(parentId))]
    .sort((a, b) => pageSortDate(b).localeCompare(pageSortDate(a)))
    .map((p) => ({
      id: String(p.id),
      slug: `${basePath}/${p.slug}`,
      title: normalizePageContent(p).title,
      excerpt: "",
      image: pageFeaturedImage(p),
      publishedAt: (p.modified ?? p.date).slice(0, 10),
      lang,
    }));
};

/**
 * 季節まとめ一覧を新しいシーズン順に組み立てる。
 *
 * CPT と移行前の固定ページの両方から集め、slug の重複は CPT を優先する。
 * 移行は季節ごとに順次進むため、一部だけ CPT 化された状態でも
 * 残りの固定ページを一覧から消さない。
 *
 * @param locale — Next の `locale` 文字列。
 * @param basePath — リンクの基底パス。旧URL側の一覧では旧パスを渡す。
 */
export const buildSeasonalIndexProps = async (
  locale: string | undefined,
  basePath = SEASONAL_REVIEWS_BASE_PATH,
): Promise<SeasonalIndexProps> => {
  const currentLocale = locale === "default" ? "ja" : (locale ?? "ja");
  const lang = currentLocale === "en" ? "en" : "ja";

  const reviews = (await getSeasonalReviews()).map(normalizeSeasonalReview);
  const cptItems: Post[] = sortSeasonalReviews(reviews).map((r) => ({
    id: String(r.id),
    slug: `${basePath}/${r.slug}`,
    title: r.title,
    excerpt: "",
    image: r.image,
    publishedAt: r.publishedAt,
    lang,
  }));
  const pageItems = await buildItemsFromPages(lang, basePath);
  const cptSlugs = new Set(cptItems.map((item) => item.slug));
  const items: Post[] = [...cptItems, ...pageItems.filter((item) => !cptSlugs.has(item.slug))];

  return { items, locale: currentLocale };
};
