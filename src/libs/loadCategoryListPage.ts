import { getCategories, getPostsWithMeta } from "@/libs/api/wordpress";
import { normalizePosts } from "@/utils/normalizePost";
import type { Post } from "@/types/post";

export const CATEGORY_LIST_PER_PAGE = 12;

export type CategoryListPageResult =
  | { notFound: true }
  | {
      categoryName: string;
      slug: string;
      posts: Post[];
      currentPage: number;
      totalPages: number;
    };

export const loadCategoryListPage = async (
  slug: string,
  locale: string,
  page: number,
): Promise<CategoryListPageResult> => {
  const currentLocale = locale === "en" ? "en" : "ja";
  const categories = await getCategories(currentLocale);
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { notFound: true };

  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const fetched = await getPostsWithMeta({
    category: category.id,
    page: safePage,
    per_page: CATEGORY_LIST_PER_PAGE,
    lang: currentLocale,
  });
  if (!fetched) return { notFound: true };

  const totalPages = Math.max(1, fetched.meta.totalPages);
  if (safePage > totalPages) return { notFound: true };

  return {
    categoryName: category.name,
    slug: category.slug,
    posts: normalizePosts(fetched.items, currentLocale),
    currentPage: safePage,
    totalPages,
  };
};
