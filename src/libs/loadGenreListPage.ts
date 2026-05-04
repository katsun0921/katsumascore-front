/** `/genre/...` アーカイブ一覧は現状常に 404 を返すスタブ。 */
// `/genre/...` アーカイブは 404
import type { Post } from "@/types/post";

export const GENRE_LIST_PER_PAGE = 12;

export type GenreListPageResult =
  | { notFound: true }
  | {
      genreName: string;
      slug: string;
      posts: Post[];
      currentPage: number;
      totalPages: number;
    };

/** 常に `{ notFound: true }` を返す。 */
export const loadGenreListPage = async (
  _slug: string,
  _locale: string,
  _page: number,
): Promise<GenreListPageResult> => {
  void _slug;
  void _locale;
  void _page;
  return { notFound: true };
};
