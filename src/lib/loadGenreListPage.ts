// SSG/ISR: revalidate 60s. Genre taxonomy（WP カスタム）アーカイブ用ローダー。
import { genreDisplayLabel, getGenres, getPostsWithMeta } from "@/lib/api/wordpress";
import { normalizePosts } from "@/lib/utils/normalizePost";
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
  slug: string,
  locale: string,
  page: number,
): Promise<GenreListPageResult> => {
  const currentLocale = locale === "en" ? "en" : "ja";
  const genres = await getGenres(currentLocale);
  const genre = genres.find((g) => g.slug === slug);
  if (!genre) return { notFound: true };

  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const fetched = await getPostsWithMeta({
    genre: genre.slug,
    page: safePage,
    per_page: GENRE_LIST_PER_PAGE,
    lang: currentLocale,
  });
  if (!fetched) return { notFound: true };

  const totalPages = Math.max(1, fetched.meta.totalPages);
  if (safePage > totalPages) return { notFound: true };

  return {
    genreName: genreDisplayLabel(genre, currentLocale),
    slug: genre.slug,
    posts: normalizePosts(fetched.items, currentLocale),
    currentPage: safePage,
    totalPages,
  };
};
