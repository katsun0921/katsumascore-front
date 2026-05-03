import { getCategoriesForArchiveResolve, getPostsWithMeta } from "@/libs/api/wordpress";
import { normalizePosts } from "@/utils/normalizePost";
import type { Post } from "@/types/post";
import type { WPCategory } from "@/types/wordpress";

export const ANIME_LIST_PER_PAGE = 12;

export type AnimeListPageResult =
  | { notFound: true }
  | {
      categoryName: string;
      posts: Post[];
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

export const loadAnimeListPage = async (
  locale: string,
  page: number,
): Promise<AnimeListPageResult> => {
  const currentLocale = locale === "en" ? "en" : "ja";
  const categories = await getCategoriesForArchiveResolve(currentLocale);
  const meta = resolveAnimeCategoryMeta(categories);
  if (!meta) return { notFound: true };

  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const fetched = await getPostsWithMeta({
    category: meta.id,
    page: safePage,
    per_page: ANIME_LIST_PER_PAGE,
    lang: currentLocale,
  });
  if (!fetched) return { notFound: true };

  const totalPages = Math.max(1, fetched.meta.totalPages);
  if (safePage > totalPages) return { notFound: true };

  return {
    categoryName: meta.name,
    posts: normalizePosts(fetched.items, currentLocale),
    currentPage: safePage,
    totalPages,
  };
};
