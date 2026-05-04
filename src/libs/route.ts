// ISR: revalidate per page. This module is server-side only (no client imports).

export type PostType = 'movie' | 'anime' | 'drama'
export type TaxonomyType = 'genre' | 'tag' | 'franchise'
export type EntityType = 'actor' | 'director' | 'company'

const DEFAULT_LOCALE = 'ja';

export const normalizeRouteLocale = (lang: string | undefined): 'ja' | 'en' =>
  lang === 'en' ? 'en' : DEFAULT_LOCALE;

/** ja は `/ja`、en は `/en` */
export const getLocalePathPrefix = (lang: string): string =>
  `/${normalizeRouteLocale(lang)}`;

// WP category slug → PostType mapping. Extend when actual WP slugs are known.
const WP_CATEGORY_TO_POST_TYPE: Partial<Record<string, PostType>> = {
  movie: 'movie',
  anime: 'anime',
  drama: 'drama',
};

export const getPostTypeCategorySlug = (postType: PostType): string => {
  const pairs = Object.entries(WP_CATEGORY_TO_POST_TYPE) as [string, PostType][];
  for (const [slug, t] of pairs) {
    if (t === postType) {
      return slug;
    }
  }
  return postType;
};

export type PostTypeArchivePathParams = {
  type: PostType
  lang?: string
};

/** 映画・アニメ・ドラマの記事一覧トップ（ja は `/movie` 等、en は `/en/movie`） */
export const getPostTypeArchivePath = ({
  type,
  lang = DEFAULT_LOCALE,
}: PostTypeArchivePathParams): string =>
  `${getLocalePathPrefix(lang)}/${getPostTypeCategorySlug(type)}`;

/**
 * 記事一覧の URL（ページネーションは `?page=N`。1 ページ目はクエリなし）
 * 実体は next.config の rewrite で `/[type]/page/N` に委譲し ISR を維持する。
 */
export const getPostTypeArchiveUrl = ({
  type,
  lang = DEFAULT_LOCALE,
  page = 1,
}: PostTypeArchivePathParams & { page?: number }): string => {
  const base = getPostTypeArchivePath({ type, lang });
  if (page <= 1) return base;
  return `${base}?${new URLSearchParams({ page: String(page) }).toString()}`;
};

export const getPostUrl = (type: PostType, slug: string, lang = DEFAULT_LOCALE): string =>
  `${getPostTypeArchivePath({ type, lang })}/${slug}`;

export const getTaxonomyUrl = (taxonomy: TaxonomyType, slug: string, lang = DEFAULT_LOCALE): string =>
  `${getLocalePathPrefix(lang)}/${taxonomy}/${slug}`;

export const getEntityUrl = (type: EntityType, slug: string, lang = DEFAULT_LOCALE): string =>
  `${getLocalePathPrefix(lang)}/${type}/${slug}`;

export const resolvePostType = (categorySlug: string | undefined): PostType =>
  (categorySlug !== undefined ? WP_CATEGORY_TO_POST_TYPE[categorySlug] : undefined) ?? 'movie';
