/**
 * 任意カテゴリ（スラッグ指定）の記事一覧ページ用データ取得。
 * allPosts（フィルタ用全件）は ISR から除外し、CSR（/api/category-filter-posts）で取得する。
 */
import { getCategoriesForArchiveResolve, getPostsWithMeta } from "@/libs/api/wordpress";
import { normalizePosts } from "@/utils/normalizePost";
import { toSerializableValue } from "@/utils/toSerializableValue";
import { CATEGORY_LIST_PER_PAGE } from "@/libs/listFilters";
import type { Post } from "@/types/post";

export { CATEGORY_LIST_PER_PAGE } from "@/libs/listFilters";

export type CategoryListPageResult =
  | { notFound: true }
  | {
      categoryName: string;
      slug: string;
      posts: Post[];
      currentPage: number;
      totalPages: number;
    };

// _embed=1 付き取得はデフォルト 3s では不足するため 10s に拡張する
const POSTS_FETCH_OPTIONS = { timeoutMs: 10000, maxRetries: 1 } as const;

/** カテゴリ `slug` の表示ページ分（`perPage` 件）のみを ISR 向けに取得して返す。
 * allPosts は含まない（CSR で /api/category-filter-posts を利用）。 */
export const loadCategoryListPage = async (
  slug: string,
  locale: string,
  page: number,
  perPage: number = CATEGORY_LIST_PER_PAGE,
): Promise<CategoryListPageResult> => {
  const currentLocale = locale === "en" ? "en" : "ja";
  const categories = await getCategoriesForArchiveResolve(POSTS_FETCH_OPTIONS);
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { notFound: true };

  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;

  const result = await getPostsWithMeta({
    category: category.id,
    page: safePage,
    per_page: perPage,
  }, POSTS_FETCH_OPTIONS);
  if (!result) return { notFound: true };

  const totalPages = Math.max(1, result.meta.totalPages);
  if (safePage > totalPages) return { notFound: true };

  const normalizedPosts = normalizePosts(result.items, currentLocale);

  return {
    categoryName: category.name,
    slug: category.slug,
    posts: toSerializableValue(normalizedPosts),
    currentPage: safePage,
    totalPages,
  };
};
