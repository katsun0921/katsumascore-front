// SSG/ISR: revalidate 60s. Shared loader for tag-based list pages.
import { getTags, getPostsWithMeta } from '@/libs/api/wordpress';
import { normalizePosts } from '@/utils/normalizePost';
import type { Post } from '@/types/post';

export const TAG_LIST_PER_PAGE = 12;

export type TagListPageResult =
  | { notFound: true }
  | {
      tagName: string;
      slug: string;
      posts: Post[];
      currentPage: number;
      totalPages: number;
    };

export const loadTagListPage = async (
  slug: string,
  locale: string,
  page: number,
): Promise<TagListPageResult> => {
  const currentLocale = locale === 'en' ? 'en' : 'ja';
  const tags = await getTags(currentLocale);
  const tag = tags.find((t) => t.slug === slug);
  if (!tag) return { notFound: true };

  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const fetched = await getPostsWithMeta({
    tags: tag.id,
    page: safePage,
    per_page: TAG_LIST_PER_PAGE,
    lang: currentLocale,
  });
  if (!fetched) return { notFound: true };

  const totalPages = Math.max(1, fetched.meta.totalPages);
  if (safePage > totalPages) return { notFound: true };

  return {
    tagName: tag.name,
    slug: tag.slug,
    posts: normalizePosts(fetched.items, currentLocale),
    currentPage: safePage,
    totalPages,
  };
};
