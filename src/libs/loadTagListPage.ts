/** タグアーカイブ一覧は現状常に 404 を返すスタブ。 */
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

/** 常に `{ notFound: true }` を返す。 */
export const loadTagListPage = async (
  _slug: string,
  _locale: string,
  _page: number,
): Promise<TagListPageResult> => {
  void _slug;
  void _locale;
  void _page;
  return { notFound: true };
};
