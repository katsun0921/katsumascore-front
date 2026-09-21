/**
 * 季節まとめ（`seasonal_review` CPT）の正規化・並び替えヘルパー。
 *
 * WordPress 依存の型（`WPSeasonalReview`）をコンポーネントへ渡す前に、
 * ここで表示用の形へ落とす。
 */
import type { WPSeasonalReview, WPSeasonalReviewEntry } from "@/libs/api/wordpress";

/** まとめページに並ぶ作品1件分（表示用）。 */
export type SeasonalEntry = {
  /** 個別作品記事の投稿ID。リンク解決に使う */
  postId: number;
  /** 個別作品記事のスラッグ。取得できなければ null */
  slug: string | null;
  title: string;
  category: "anime" | "drama" | "movie";
  memo: string;
};

/** 季節まとめハブ（表示用）。 */
export type SeasonalReview = {
  id: number;
  slug: string;
  title: string;
  html: string | null;
  /** `2026q3` 形式。並び替えキー */
  sortKey: string;
  image: string | null;
  publishedAt: string;
  entries: SeasonalEntry[];
};

/** ACF の数値フィールドは文字列で返ることがあるため、数値へ寄せる。 */
const toNumber = (value: number | string | undefined | ""): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * `year` / `quarter` から並び替えキー（`2026q3`）を組み立てる。
 * ACF の `sort_key` が入力済みならそれを優先する。
 *
 * WordPress 側では `sort_key` は任意項目で、`year` / `quarter` が必須。
 * したがって `sort_key` 未入力のハブが存在しうるため、ここで導出して
 * 並び順が崩れないようにする。
 */
export const buildSortKey = (acf: WPSeasonalReview["acf"]): string => {
  const explicit = acf?.sort_key?.trim();
  if (explicit) return explicit;
  const year = toNumber(acf?.year);
  const quarter = acf?.quarter;
  if (year === null || !quarter) return "";
  return `${year}${quarter}`;
};

/** ACF repeater は空のとき `false` を返すため、常に配列へ正規化する。 */
const toEntryRows = (entries: WPSeasonalReviewEntry[] | false | undefined): WPSeasonalReviewEntry[] =>
  Array.isArray(entries) ? entries : [];

/** `post_object` は object / ID / false のいずれかで返るため、必要な値を取り出す。 */
const readEntryPost = (
  post: WPSeasonalReviewEntry["post"],
): { postId: number; slug: string | null; title: string } | null => {
  if (typeof post === "number") {
    return post > 0 ? { postId: post, slug: null, title: "" } : null;
  }
  if (post === null || post === undefined || post === false) return null;
  const postId = Number(post.ID);
  if (!Number.isFinite(postId) || postId <= 0) return null;
  return {
    postId,
    slug: post.post_name || null,
    title: post.post_title ?? "",
  };
};

/**
 * `entries` リピーターを表示用の配列へ正規化する。
 *
 * 並び順は `display_order` の昇順。未入力の行は入力済みの行より後ろに置き、
 * 同順のものは元の行順を保つ（安定ソート）。
 */
export const normalizeSeasonalEntries = (
  entries: WPSeasonalReviewEntry[] | false | undefined,
): SeasonalEntry[] => {
  const rows = toEntryRows(entries);
  const mapped: { entry: SeasonalEntry; order: number | null; index: number }[] = [];

  rows.forEach((row, index) => {
    const post = readEntryPost(row.post);
    if (!post) return;
    const category = row.category === "drama" || row.category === "movie" ? row.category : "anime";
    mapped.push({
      entry: {
        postId: post.postId,
        slug: post.slug,
        title: post.title,
        category,
        memo: row.memo?.trim() ?? "",
      },
      order: toNumber(row.display_order),
      index,
    });
  });

  return mapped
    .sort((a, b) => {
      if (a.order === b.order) return a.index - b.index;
      if (a.order === null) return 1;
      if (b.order === null) return -1;
      return a.order - b.order;
    })
    .map((m) => m.entry);
};

/** `_embed` で返るアイキャッチ画像のURLを取り出す。 */
const readFeaturedImage = (review: WPSeasonalReview): string | null =>
  review._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;

/** `WPSeasonalReview` を表示用の `SeasonalReview` へ正規化する。 */
export const normalizeSeasonalReview = (review: WPSeasonalReview): SeasonalReview => ({
  id: review.id,
  slug: review.slug,
  title: review.title?.rendered ?? "",
  html: review.content?.rendered ?? null,
  sortKey: buildSortKey(review.acf),
  image: readFeaturedImage(review),
  publishedAt: (review.modified ?? review.date ?? "").slice(0, 10),
  entries: normalizeSeasonalEntries(review.acf?.entries),
});

/**
 * 季節まとめを新しいシーズン順（降順）に並べる。
 *
 * `sort_key`（`2026q3`）は辞書順がそのまま時系列順になるため文字列比較で足りる。
 * 更新日でソートすると一括更新時に順序が崩れるため使わない。
 * `year` / `quarter` からも導出できないものだけが末尾へ送られる。
 */
export const sortSeasonalReviews = <T extends { sortKey: string; publishedAt: string }>(
  reviews: T[],
): T[] =>
  [...reviews].sort((a, b) => {
    if (!a.sortKey && !b.sortKey) return b.publishedAt.localeCompare(a.publishedAt);
    if (!a.sortKey) return 1;
    if (!b.sortKey) return -1;
    return b.sortKey.localeCompare(a.sortKey);
  });
