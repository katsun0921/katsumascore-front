import { getCategoriesForArchiveResolve, getPostsWithMeta } from "@/libs/api/wordpress";
import { normalizePosts } from "@/utils/normalizePost";
import type { Post } from "@/types/post";
import type { WPPost } from "@/types/wordpress";

export const CATEGORY_LIST_PER_PAGE = 13;

export type CategoryListPageResult =
  | { notFound: true }
  | {
      categoryName: string;
      slug: string;
      posts: Post[];
      allPosts: Post[];
      currentPage: number;
      totalPages: number;
    };

export const loadCategoryListPage = async (
  slug: string,
  locale: string,
  page: number,
): Promise<CategoryListPageResult> => {
  const currentLocale = locale === "en" ? "en" : "ja";
  const categories = await getCategoriesForArchiveResolve(currentLocale);
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
      lang: currentLocale,
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

  return {
    categoryName: category.name,
    slug: category.slug,
    posts: normalizedPosts.slice(start, start + CATEGORY_LIST_PER_PAGE),
    allPosts: normalizedPosts,
    currentPage: safePage,
    totalPages,
  };
};
