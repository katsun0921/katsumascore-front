/**
 * SSG 凍結ビルドで `getStaticPaths` が返すパスを、WordPress の公開データから全件列挙する。
 *
 * 凍結モード（`NEXT_PUBLIC_SSG_FREEZE=1`）以外では空配列を返し、従来の ISR 挙動を変えない。
 * 取得失敗は `wpFetchGuard` がビルドごと止めるため、ここでは「0 件だった」場合のみ明示的に失敗させる。
 */
import type { GetStaticPathsResult } from 'next';
import {
  getCategories,
  getFeaturedPages,
  getAllFranchiseSlugs,
  getPersons,
  getSitemapPosts,
  getTags,
  getVodReleases,
  getTheaterReleases,
} from '@/libs/api/wordpress';
import { wpApiBaseUrl } from '@/libs/api/wordpress/client';
import { loadCategoryListPage } from '@/libs/loadCategoryListPage';
import { loadGenreListPage } from '@/libs/loadGenreListPage';
import { loadStaticGenres } from '@/libs/getStaticGenres';
import { loadTagListPage } from '@/libs/loadTagListPage';
import { loadVodArchivePage } from '@/libs/loadVodArchivePage';
import { VOD_ARCHIVE_PATH_SLUGS } from '@/libs/vodPathToWpSlug';
import { isWpMockMode } from '@/libs/wpMockMode';
import { isSsgFreeze } from './ssgFreeze';

const LOCALES = ['ja', 'en'] as const;
type FreezeLocale = (typeof LOCALES)[number];
type PostType = 'movie' | 'anime' | 'drama';
type Path = GetStaticPathsResult['paths'][number];

/** WP カテゴリスラッグ → 記事種別。ここに無いカテゴリの記事は詳細ページが存在しない。 */
const POST_TYPES: readonly PostType[] = ['movie', 'anime', 'drama'];

/** 種別ごとの生成件数をビルドログへ出す（Step 5: 生成ページ数の確認用）。 */
const logCount = (kind: string, paths: Path[]): Path[] => {
  console.log(`[ssg-freeze] paths ${kind}: ${paths.length}`);
  return paths;
};

/** 0 件は WP 側の異常とみなしてビルドを失敗させる（空データのデプロイ防止）。モックモードはデータが少ないため対象外。 */
const requireNonEmpty = <T>(kind: string, items: T[]): T[] => {
  if (items.length === 0 && !isWpMockMode()) throw new Error(`[ssg-freeze] ${kind} が 0 件のためビルドを中止する`);
  return items;
};

/** slug 一覧を全ロケール分のパスへ展開する。 */
const slugsToPaths = (slugs: string[], locales: readonly FreezeLocale[] = LOCALES): Path[] =>
  locales.flatMap((locale) => slugs.map((slug) => ({ params: { slug }, locale })));

/** REST コレクションの slug を `X-WP-TotalPages` に従って全ページ取得する。 */
const listAllSlugs = async (path: string): Promise<string[]> => {
  if (!wpApiBaseUrl) throw new Error('[ssg-freeze] WP_API_URL が未設定');
  const slugs: string[] = [];
  let totalPages = 1;
  for (let page = 1; page <= totalPages; page += 1) {
    const res = await fetch(`${wpApiBaseUrl}${path}?per_page=100&page=${page}&_fields=slug`);
    if (!res.ok) throw new Error(`[ssg-freeze] ${path} の取得に失敗: HTTP ${res.status}`);
    totalPages = Number.parseInt(res.headers.get('X-WP-TotalPages') ?? '1', 10) || 1;
    const data: unknown = await res.json();
    if (Array.isArray(data)) {
      for (const item of data) {
        const slug = (item as { slug?: unknown }).slug;
        if (typeof slug === 'string') slugs.push(slug);
      }
    }
  }
  return slugs;
};

/** モックモードでは既存の取得関数、実運用では REST を全ページ取得して slug を返す。 */
const collectSlugs = async (path: string, mock: () => Promise<string[]>): Promise<string[]> =>
  isWpMockMode() ? mock() : listAllSlugs(path);

/** 1 ページ目の `totalPages` を使い、2 ページ目以降のページ番号を列挙する。 */
const pageNumbers = (totalPages: number): string[] =>
  Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => String(i + 2));

/**
 * 記事詳細（`/movie|anime|drama/[slug]`）のパス。
 * サイトマップと同じ規則で、カテゴリから種別を決め、ACF `lang` のロケールでのみ列挙する。
 */
export const enumeratePostDetailPaths = async (type: PostType): Promise<Path[]> => {
  if (!isSsgFreeze()) return [];
  const [posts, categories] = await Promise.all([getSitemapPosts(100, 1000), getCategories()]);
  if (posts === null) throw new Error('[ssg-freeze] 記事スラッグを取得できなかった');
  const typeByCategoryId = new Map<number, PostType>(
    categories.flatMap((c) => (POST_TYPES.includes(c.slug as PostType) ? [[c.id, c.slug as PostType] as const] : [])),
  );
  const paths = posts.flatMap((p): Path[] => {
    const types = new Set((p.categories ?? []).flatMap((id) => typeByCategoryId.get(id) ?? []));
    if (!types.has(type)) return [];
    const locales: readonly FreezeLocale[] = p.acf?.lang === 'en' ? ['en'] : p.acf?.lang === 'ja' ? ['ja'] : LOCALES;
    return locales.map((locale) => ({ params: { slug: p.slug }, locale }));
  });
  requireNonEmpty(`記事詳細(${type})`, paths);
  return logCount(`post-detail:${type}`, paths);
};

/** 一覧 2 ページ目以降（`/movie|anime|drama/page/[page]`）のパス。 */
export const enumerateCategoryPagedPaths = async (categorySlug: string, perPage: number): Promise<Path[]> => {
  if (!isSsgFreeze()) return [];
  const paths: Path[] = [];
  for (const locale of LOCALES) {
    const first = await loadCategoryListPage(categorySlug, locale, 1, perPage);
    if ('fetchFailed' in first) throw new Error(`[ssg-freeze] ${categorySlug} 一覧を取得できなかった`);
    if ('notFound' in first) continue;
    for (const page of pageNumbers(first.totalPages)) paths.push({ params: { page }, locale });
  }
  return logCount(`category-paged:${categorySlug}`, paths);
};

/** 固定ページ（`/[slug]`）のパス。 */
export const enumerateFeaturedPagePaths = async (): Promise<Path[]> => {
  if (!isSsgFreeze()) return [];
  const pages = await getFeaturedPages();
  return logCount('featured-pages', slugsToPaths(pages.map((p) => p.slug)));
};

/** person 詳細のパス。 */
export const enumeratePersonPaths = async (): Promise<Path[]> => {
  if (!isSsgFreeze()) return [];
  const slugs = await collectSlugs('/persons', async () => (await getPersons(100)).map((p) => p.slug));
  return logCount('person', slugsToPaths(requireNonEmpty('person', slugs)));
};

/** company 詳細のパス。 */
export const enumerateCompanyPaths = async (): Promise<Path[]> => {
  if (!isSsgFreeze()) return [];
  const slugs = await collectSlugs('/companies', async () => []);
  return logCount('company', slugsToPaths(slugs));
};

/** franchise 詳細のパス。 */
export const enumerateFranchisePaths = async (): Promise<Path[]> => {
  if (!isSsgFreeze()) return [];
  const slugs = await collectSlugs('/franchise', () => getAllFranchiseSlugs());
  return logCount('franchise', slugsToPaths(slugs));
};

/** タグ一覧 1 ページ目（`/tag/[slug]`）のパス。 */
export const enumerateTagPaths = async (): Promise<Path[]> => {
  if (!isSsgFreeze()) return [];
  const slugs = await collectSlugs('/tags', async () => (await getTags()).map((t) => t.slug));
  return logCount('tag', slugsToPaths(requireNonEmpty('tag', slugs)));
};

/** タグ一覧 2 ページ目以降（`/tag/[slug]/p/[p]`）のパス。 */
export const enumerateTagPagedPaths = async (): Promise<Path[]> => {
  if (!isSsgFreeze()) return [];
  const slugs = await collectSlugs('/tags', async () => (await getTags()).map((t) => t.slug));
  const paths: Path[] = [];
  for (const locale of LOCALES) {
    for (const slug of slugs) {
      const first = await loadTagListPage(slug, locale, 1);
      if ('notFound' in first) continue;
      for (const p of pageNumbers(first.totalPages)) paths.push({ params: { slug, p }, locale });
    }
  }
  return logCount('tag-paged', paths);
};

/** ジャンル一覧 2 ページ目以降（`/genre/[slug]/p/[p]`）のパス。 */
export const enumerateGenrePagedPaths = async (): Promise<Path[]> => {
  if (!isSsgFreeze()) return [];
  const genres = await loadStaticGenres();
  const paths: Path[] = [];
  for (const locale of LOCALES) {
    for (const genre of genres) {
      const first = await loadGenreListPage(genre.slug, locale, 1);
      if ('notFound' in first) continue;
      for (const p of pageNumbers(first.totalPages)) paths.push({ params: { slug: genre.slug, p }, locale });
    }
  }
  return logCount('genre-paged', paths);
};

/** VOD サービス別一覧 1 ページ目（`/vod/[slug]`）のパス。 */
export const enumerateVodSlugPaths = async (): Promise<Path[]> => {
  if (!isSsgFreeze()) return [];
  return logCount('vod', slugsToPaths([...VOD_ARCHIVE_PATH_SLUGS]));
};

/** VOD サービス別一覧 2 ページ目以降（`/vod/[slug]/page/[page]`）のパス。 */
export const enumerateVodPagedPaths = async (): Promise<Path[]> => {
  if (!isSsgFreeze()) return [];
  const paths: Path[] = [];
  for (const locale of LOCALES) {
    for (const slug of VOD_ARCHIVE_PATH_SLUGS) {
      const first = await loadVodArchivePage(slug, locale, 1);
      if ('fetchFailed' in first) throw new Error(`[ssg-freeze] VOD ${slug} を取得できなかった`);
      if ('notFound' in first) continue;
      for (const page of pageNumbers(first.totalPages)) paths.push({ params: { slug, page }, locale });
    }
  }
  return logCount('vod-paged', paths);
};

/** VOD 配信情報（週次まとめ）詳細のパス。日本語記事のみのため ja だけ列挙する。 */
export const enumerateVodReleasePaths = async (): Promise<Path[]> => {
  if (!isSsgFreeze()) return [];
  const slugs = await collectSlugs('/vod_release', async () => (await getVodReleases(100)).map((r) => r.slug));
  return logCount('vod-release', slugsToPaths(slugs, ['ja']));
};

/** 劇場公開情報（週次まとめ）詳細のパス。日本語記事のみのため ja だけ列挙する。 */
export const enumerateTheaterReleasePaths = async (): Promise<Path[]> => {
  if (!isSsgFreeze()) return [];
  const slugs = await collectSlugs('/theater_release', async () => (await getTheaterReleases(100)).map((r) => r.slug));
  return logCount('theater-release', slugsToPaths(slugs, ['ja']));
};
