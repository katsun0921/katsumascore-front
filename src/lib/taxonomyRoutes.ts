/**
 * 旧実装で `/genre/[slug]` がカテゴリアーカイブとして使われていた WP category slug。
 * `/categories/[slug]` へ恒久的リダイレクトする（ARCHITECTURE §5 と整合）。
 */
/** WP 本番の slug が `movie` の場合と `movie-ja` の場合の両方を想定 */
export const LEGACY_GENRE_PATH_CATEGORY_SLUGS = ["movie-ja", "movie", "anime", "drama"] as const;

export const legacyGenrePathCategorySlugPattern = LEGACY_GENRE_PATH_CATEGORY_SLUGS.join("|");
