/**
 * 任意カテゴリ（スラッグ指定）の記事一覧ページ用データ取得。
 */
import { getCategoriesForArchiveResolve, getPostsWithMeta } from "@/libs/api/wordpress";
import { normalizePosts } from "@/utils/normalizePost";
import { toSerializableValue } from "@/utils/toSerializableValue";
import { CATEGORY_LIST_PER_PAGE } from "@/libs/listFilters";
import type { FilterPost, Post } from "@/types/post";
import type { WPPost } from "@/types/wordpress";

export { CATEGORY_LIST_PER_PAGE } from "@/libs/listFilters";

export type CategoryListPageResult =
  | { notFound: true }
  | {
      categoryName: string;
      slug: string;
      posts: Post[];
      allPosts: FilterPost[];
      currentPage: number;
      totalPages: number;
    };

/** カテゴリ `slug` の一覧をページ分割して返す。存在しないカテゴリやページ範囲外は `notFound`。 */
export const loadCategoryListPage = async (
  slug: string,
  locale: string,
  page: number,
): Promise<CategoryListPageResult> => {
  const currentLocale = locale === "en" ? "en" : "ja";
  const categories = await getCategoriesForArchiveResolve();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { notFound: true };

  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const rawPosts: WPPost[] = [];
  let rawTotalPages = 1;
  for (let rawPage = 1; rawPage <= rawTotalPages; rawPage += 1) {
    const fetched = await getPostsWithMeta({
      category: category.id,
      page: rawPage,
      per_page: CATEGORY_LIST_PER_PAGE,
    });
    if (!fetched) return { notFound: true };
    rawPosts.push(...fetched.items);
    rawTotalPages = Math.max(1, fetched.meta.totalPages);
  }

  const normalizedPosts = normalizePosts(rawPosts, currentLocale);
  const normalizedTotalPages = Math.max(1, Math.ceil(normalizedPosts.length / CATEGORY_LIST_PER_PAGE));
  const totalPages = normalizedTotalPages;
  if (safePage > totalPages) return { notFound: true };
  const start = (safePage - 1) * CATEGORY_LIST_PER_PAGE;

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
    categoryName: category.name,
    slug: category.slug,
    posts: toSerializableValue(normalizedPosts.slice(start, start + CATEGORY_LIST_PER_PAGE)),
    allPosts: toSerializableValue(allPosts),
    currentPage: safePage,
    totalPages,
  };
};
