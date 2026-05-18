/**
 * タグタクソノミー別の記事一覧ページ用データ取得（スラッグ → WP tag ターム → 投稿一覧）。
 */
import { getTagBySlug, getPostsWithMeta } from "@/libs/api/wordpress";
import { normalizePosts } from "@/utils/normalizePost";
import { toSerializableValue } from "@/utils/toSerializableValue";
import type { Post } from "@/types/post";
import type { WPPost } from "@/types/wordpress";

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

/** タグ `slug` の記事一覧をページ分割して返す。存在しないタグやページ範囲外は `notFound`。 */
export const loadTagListPage = async (
  slug: string,
  locale: string,
  page: number,
): Promise<TagListPageResult> => {
  const currentLocale = locale === "en" ? "en" : "ja";
  const trimmed = slug.trim();
  if (!trimmed) return { notFound: true };

  const tag = await getTagBySlug(trimmed);
  if (!tag) return { notFound: true };

  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const rawPosts: WPPost[] = [];
  let rawTotalPages = 1;
  for (let rawPage = 1; rawPage <= rawTotalPages; rawPage += 1) {
    const fetched = await getPostsWithMeta({
      tags: tag.id,
      page: rawPage,
      per_page: TAG_LIST_PER_PAGE,
    });
    if (!fetched) {
      if (rawPage === 1) {
        rawTotalPages = 1;
        break;
      }
      return { notFound: true };
    }
    rawPosts.push(...fetched.items);
    rawTotalPages = Math.max(1, fetched.meta.totalPages);
  }

  const normalizedPosts = normalizePosts(rawPosts, currentLocale);
  const totalPages = Math.max(
    1,
    Math.ceil(normalizedPosts.length / TAG_LIST_PER_PAGE),
  );
  if (safePage > totalPages) return { notFound: true };
  const start = (safePage - 1) * TAG_LIST_PER_PAGE;

  return {
    tagName: tag.name,
    slug: trimmed,
    posts: toSerializableValue(
      normalizedPosts.slice(start, start + TAG_LIST_PER_PAGE),
    ),
    currentPage: safePage,
    totalPages,
  };
};
