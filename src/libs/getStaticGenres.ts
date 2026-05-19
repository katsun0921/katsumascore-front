import type { WPGenreTerm } from '@/libs/api/wordpress/endpoints/genre';
import type { GenreNavTag } from '@/components/features/GenreNav/GenreNav';
import { genreDisplayLabel } from '@/libs/api/wordpress';

/** generate-genres.mjs でビルド前に生成した genres.json を読み込む。SSG 時専用（Node.js 環境のみ）。 */
export const loadStaticGenres = async (): Promise<WPGenreTerm[]> => {
  // dynamic import で Edge/ブラウザ環境での実行を防ぐ
  const { readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const filePath = join(process.cwd(), 'src/data/genres.json');
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WPGenreTerm[]) : [];
  } catch {
    return [];
  }
};

/** genres.json から GenreNavTag[] に変換する。 */
export const loadStaticGenreNavTags = async (locale: string): Promise<GenreNavTag[]> => {
  const genres = await loadStaticGenres();
  return genres.map((g) => ({
    slug: g.slug,
    name: genreDisplayLabel(g, locale),
    count: g.count,
  }));
};
