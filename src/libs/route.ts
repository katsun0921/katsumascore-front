/**
 * 記事種別・タクソノミー・人物エンティティの URL パスを組み立てる（ISR 用。クライアントから import しない）。
 */
// ISR: revalidate per page. This module is server-side only (no client imports).

export type PostType = 'movie' | 'anime' | 'drama'
export type TaxonomyType = 'genre' | 'tag' | 'franchise'
export type EntityType = 'actor' | 'director' | 'company' | 'person'

const DEFAULT_LOCALE = 'ja';

/** 任意の `lang` 文字列をルーティング用の `ja` / `en` に正規化する。`en` 以外はすべて `ja`。 */
export const normalizeRouteLocale = (lang: string | undefined): 'ja' | 'en' =>
  lang === 'en' ? 'en' : DEFAULT_LOCALE;

/** ロケールに応じたパス接頭辞。`ja` は `/ja`、`en` は `/en`。 */
export const getLocalePathPrefix = (lang: string): string =>
  `/${normalizeRouteLocale(lang)}`;

// WP category slug → PostType mapping. Extend when actual WP slugs are known.
const WP_CATEGORY_TO_POST_TYPE: Partial<Record<string, PostType>> = {
  movie: 'movie',
  anime: 'anime',
  drama: 'drama',
};

/** 内部の PostType から、WordPress カテゴリスラッグ（アーカイブ URL 用）を逆引きする。未定義時は PostType 名をそのまま返す。 */
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

/** 記事詳細のパス（アーカイブ基底 + 投稿スラッグ）。 */
export const getPostUrl = (type: PostType, slug: string, lang = DEFAULT_LOCALE): string =>
  `${getPostTypeArchivePath({ type, lang })}/${slug}`;

/** ジャンル・タグ・フランチャイズなどタクソノミーアーカイブのパス。 */
export const getTaxonomyUrl = (taxonomy: TaxonomyType, slug: string, lang = DEFAULT_LOCALE): string =>
  `${getLocalePathPrefix(lang)}/${taxonomy}/${slug}`;

/** 俳優・監督・会社などエンティティページのパス。 */
export const getEntityUrl = (type: EntityType, slug: string, lang = DEFAULT_LOCALE): string =>
  `${getLocalePathPrefix(lang)}/${type}/${slug}`;

/** VOD ハブ（サービス一覧）のパス（例: `/ja/vod`）。 */
export const getVodHubPath = (lang = DEFAULT_LOCALE): string =>
  `${getLocalePathPrefix(lang)}/vod`;

/** VOD配信情報（週次まとめ記事）アーカイブのパス（例: `/ja/vod-release`）。 */
export const getVodReleaseArchivePath = (lang = DEFAULT_LOCALE): string =>
  `${getLocalePathPrefix(lang)}/vod-release`;

/** VOD配信情報（週次まとめ記事）詳細のパス（例: `/ja/vod-release/2026-08-w2`）。 */
export const getVodReleaseUrl = (slug: string, lang = DEFAULT_LOCALE): string =>
  `${getVodReleaseArchivePath(lang)}/${slug}`;

/** VOD 一覧の基底パス（例: `/ja/vod/netflix`）。 */
export const getVodArchivePath = (pathSlug: string, lang = DEFAULT_LOCALE): string =>
  `${getLocalePathPrefix(lang)}/vod/${pathSlug}`;

/**
 * VOD 別記事一覧の URL。1 ページ目はクエリなし、2 ページ目以降は公開 URL を `?page=N` とし、
 * middleware で `/[lang]/vod/[slug]/page/N` に rewrite する。
 */
export const getVodArchiveUrl = (pathSlug: string, lang = DEFAULT_LOCALE, page = 1): string => {
  const base = getVodArchivePath(pathSlug, lang);
  if (page <= 1) return base;
  return `${base}?${new URLSearchParams({ page: String(page) }).toString()}`;
};

/**
 * VOD 別記事一覧の Next.js 内部ルーティングパス。
 * クライアントサイドナビゲーション時に `router.push` の `href` として使い、
 * `as` に `getVodArchiveUrl` を渡すことでブラウザ URL を `?page=N` 形式に保つ。
 */
export const getVodArchiveNextPath = (pathSlug: string, lang = DEFAULT_LOCALE, page = 1): string => {
  const base = getVodArchivePath(pathSlug, lang);
  if (page <= 1) return base;
  return `${base}/page/${page}`;
};

/**
 * 記事一覧の Next.js 内部ルーティングパス。
 * クライアントサイドナビゲーション時に `router.push` の `href` として使い、
 * `as` に `getPostTypeArchiveUrl` を渡すことでブラウザ URL を `?page=N` 形式に保つ。
 */
export const getPostTypeArchiveNextPath = ({
  type,
  lang = DEFAULT_LOCALE,
  page = 1,
}: PostTypeArchivePathParams & { page?: number }): string => {
  const base = getPostTypeArchivePath({ type, lang });
  if (page <= 1) return base;
  return `${base}/page/${page}`;
};

/** WP カテゴリスラッグから PostType を解決する。未マッピングは `movie`。 */
export const resolvePostType = (categorySlug: string | undefined): PostType =>
  (categorySlug !== undefined ? WP_CATEGORY_TO_POST_TYPE[categorySlug] : undefined) ?? 'movie';
