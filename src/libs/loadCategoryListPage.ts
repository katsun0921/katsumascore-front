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

// _embed=1 付き 100件取得はデフォルト 3s では足りないため 10s に拡張する
const POSTS_FETCH_OPTIONS = { timeoutMs: 10000, maxRetries: 1 } as const;

/** カテゴリ `slug` の一覧をページ分割して返す。存在しないカテゴリやページ範囲外は `notFound`。 */
export const loadCategoryListPage = async (
  slug: string,
  locale: string,
  page: number,
): Promise<CategoryListPageResult> => {
  const currentLocale = locale === "en" ? "en" : "ja";
  const categories = await getCategoriesForArchiveResolve(POSTS_FETCH_OPTIONS);
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { notFound: true };

  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;

  // 1ページ目で totalPages を確定する
  const first = await getPostsWithMeta({
    category: category.id,
    page: 1,
    per_page: 100,
  }, POSTS_FETCH_OPTIONS);
  if (!first) return { notFound: true };
  const rawTotalPages = Math.max(1, first.meta.totalPages);
  const rawPosts: WPPost[] = [...first.items];

  // 2ページ目以降は並列取得する（逐次だと記事数増加で WP API の合計待ち時間が膨らみ
  // 1ページでもタイムアウトするとカテゴリ全体が 404 に落ちるため）
  if (rawTotalPages > 1) {
    const remainingPages = Array.from({ length: rawTotalPages - 1 }, (_, i) => i + 2);
    const batches = await Promise.all(
      remainingPages.map((rawPage) =>
        getPostsWithMeta({
          category: category.id,
          page: rawPage,
          per_page: 100,
        }, POSTS_FETCH_OPTIONS),
      ),
    );
    if (batches.some((batch) => batch === null)) return { notFound: true };
    for (const batch of batches) {
      if (batch) rawPosts.push(...batch.items);
    }
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
