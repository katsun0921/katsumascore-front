/**
 * アニメカテゴリ記事一覧ページ用。WP から全ページ取得後に正規化し、クライアント用フィルター向けに軽量行も返す。
 */
import { getCategoriesForArchiveResolve, getPostsWithMeta } from "@/libs/api/wordpress";
import { normalizePosts } from "@/utils/normalizePost";
import { toSerializableValue } from "@/utils/toSerializableValue";
import type { FilterPost, Post } from "@/types/post";
import type { WPCategory, WPPost } from "@/types/wordpress";

export const ANIME_LIST_PER_PAGE = 12;

export type AnimeListPageResult =
  | { notFound: true }
  | {
      categoryName: string;
      posts: Post[];
      allPosts: FilterPost[];
      currentPage: number;
      totalPages: number;
    };

/** TOP のアニメ枠と同じルールで WP カテゴリ（アニメ）を解決する */
export const resolveAnimeCategoryMeta = (
  categories: WPCategory[],
): { id: number; name: string } | undefined => {
  const fromEnv = process.env.WP_ANIME_CATEGORY_ID;
  if (fromEnv && /^\d+$/.test(fromEnv)) {
    const id = Number(fromEnv);
    const found = categories.find((c) => c.id === id);
    if (found) return { id: found.id, name: found.name };
  }
  const bySlug = categories.find((c) => c.slug === "anime");
  if (bySlug) return { id: bySlug.id, name: bySlug.name };
  const byNameJa = categories.find((c) => c.name.includes("アニメ"));
  if (byNameJa) return { id: byNameJa.id, name: byNameJa.name };
  const byNameEn = categories.find((c) => c.name.toLowerCase().includes("anime"));
  if (byNameEn) return { id: byNameEn.id, name: byNameEn.name };
  return undefined;
};

/** アニメ一覧の 1 ページ分と全件サマリ・ページ情報を取得する。カテゴリ解決失敗やページ範囲外は `notFound`。 */
export const loadAnimeListPage = async (
  locale: string,
  page: number,
): Promise<AnimeListPageResult> => {
  const currentLocale = locale === "en" ? "en" : "ja";
  const categories = await getCategoriesForArchiveResolve(currentLocale);
  const meta = resolveAnimeCategoryMeta(categories);
  if (!meta) return { notFound: true };

  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const rawPosts: WPPost[] = [];
  let rawTotalPages = 1;
  for (let rawPage = 1; rawPage <= rawTotalPages; rawPage += 1) {
    const fetched = await getPostsWithMeta({
      category: meta.id,
      page: rawPage,
      per_page: ANIME_LIST_PER_PAGE,
      lang: currentLocale,
    });
    if (!fetched) return { notFound: true };
    rawPosts.push(...fetched.items);
    rawTotalPages = Math.max(1, fetched.meta.totalPages);
  }

  const normalizedPosts = normalizePosts(rawPosts, currentLocale);
  const totalPages = Math.max(1, Math.ceil(normalizedPosts.length / ANIME_LIST_PER_PAGE));
  if (safePage > totalPages) return { notFound: true };
  const start = (safePage - 1) * ANIME_LIST_PER_PAGE;

  const allPosts: FilterPost[] = normalizedPosts.map(({ id, slug, score, publishedAt, vods, genres, tags }) => ({
    id,
    slug,
    score: score ?? null,
    publishedAt,
    vods: vods ?? null,
    genres: genres ?? null,
    tags: tags ?? null,
  }));

  return {
    categoryName: meta.name,
    posts: toSerializableValue(normalizedPosts.slice(start, start + ANIME_LIST_PER_PAGE)),
    allPosts: toSerializableValue(allPosts),
    currentPage: safePage,
    totalPages,
  };
};
