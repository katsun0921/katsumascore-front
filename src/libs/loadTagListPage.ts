// タグアーカイブ一覧は 404
import type { Post } from "@/types/post";

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
  _slug: string,
  _locale: string,
  _page: number,
): Promise<TagListPageResult> => ({ notFound: true });
