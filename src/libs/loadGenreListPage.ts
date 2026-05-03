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

export const loadGenreListPage = async (
  _slug: string,
  _locale: string,
  _page: number,
): Promise<GenreListPageResult> => ({ notFound: true });
