import type { WPGenreTerm } from '@/libs/api/wordpress/endpoints/genre';
import type { GenreNavTag } from '@/components/features/GenreNav/GenreNav';
import { genreDisplayLabel } from '@/libs/api/wordpress';
import genresData from '@/data/genres.json';

/**
 * generate-genres.mjs でビルド前に生成した genres.json を静的インポートで返す。
 * node:fs/promises を使わないため Cloudflare Workers での ISR リバリデーションでも動作する。
 */
export const loadStaticGenres = (): WPGenreTerm[] => {
  if (!Array.isArray(genresData)) return [];
  return genresData as unknown as WPGenreTerm[];
};

/** genres.json から GenreNavTag[] に変換する。 */
export const loadStaticGenreNavTags = async (locale: string): Promise<GenreNavTag[]> => {
  const genres = loadStaticGenres();
  return genres.map((g) => ({
    slug: g.slug,
    name: genreDisplayLabel(g, locale),
    count: g.count,
  }));
};
