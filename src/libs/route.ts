// ISR: revalidate per page. This module is server-side only (no client imports).

export type PostType = 'movie' | 'anime' | 'drama'
export type TaxonomyType = 'genre' | 'tag' | 'franchise'
export type EntityType = 'actor' | 'director' | 'company'

const DEFAULT_LOCALE = 'ja';

const localePrefix = (lang: string): string =>
  lang === DEFAULT_LOCALE ? '' : `/${lang}`;

// WP category slug → PostType mapping. Extend when actual WP slugs are known.
const WP_CATEGORY_TO_POST_TYPE: Partial<Record<string, PostType>> = {
  movie: 'movie',
  anime: 'anime',
  drama: 'drama',
};

const categorySlugForPostType = (postType: PostType): string => {
  const pairs = Object.entries(WP_CATEGORY_TO_POST_TYPE) as [string, PostType][];
  for (const [slug, t] of pairs) {
    if (t === postType) {
      return slug;
    }
  }
  return postType;
};

/** アニメ一覧のパス（ja は `/anime`、en は `/en/anime` — Next.js i18n の defaultLocale 規約） */
export const getAnimeArchivePath = (lang = DEFAULT_LOCALE): string =>
  `${localePrefix(lang)}/${categorySlugForPostType('anime')}`;

export const getPostUrl = (type: PostType, slug: string, lang = DEFAULT_LOCALE): string =>
  `${localePrefix(lang)}/${categorySlugForPostType(type)}/${slug}`;

export const getTaxonomyUrl = (taxonomy: TaxonomyType, slug: string, lang = DEFAULT_LOCALE): string =>
  `${localePrefix(lang)}/${taxonomy}/${slug}`;

export const getEntityUrl = (type: EntityType, slug: string, lang = DEFAULT_LOCALE): string =>
  `${localePrefix(lang)}/${type}/${slug}`;

export const resolvePostType = (categorySlug: string | undefined): PostType =>
  (categorySlug !== undefined ? WP_CATEGORY_TO_POST_TYPE[categorySlug] : undefined) ?? 'movie';
