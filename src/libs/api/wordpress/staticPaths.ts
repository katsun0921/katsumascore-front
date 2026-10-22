/** 詳細SSG用の公開コレクション全件列挙。途中ページの欠落・不正データはビルドを中止する。 */
import type { GetStaticPaths } from 'next';
import { wpApiBaseUrl } from './client';
import { wpFetch, isStrictWpBuild } from './transport';
import { detectLang } from './lang';
import { resolvePostType, type PostType } from '@/libs/route';
import { isWpMockMode } from '@/libs/wpMockMode';
import { mockWpPostsList, mockWpFetchPages, mockWpGetCategories } from '@/mocks/wp/mockWpQueries';

export type StaticEntry = {
  id: number;
  slug: string;
  parent?: number;
  categories?: number[];
  link?: string;
  acf?: { lang?: string } | [];
};

/** コレクションの配列とパス生成に必要なID・slugを検証する。 */
const parseEntries = (data: unknown): StaticEntry[] => {
  if (!Array.isArray(data)) throw new Error('WP collection is not an array');
  for (const entry of data) {
    if (!entry || typeof entry.id !== 'number' || typeof entry.slug !== 'string' || !entry.slug) {
      throw new Error('WP collection contains an invalid path entry');
    }
  }
  return data as StaticEntry[];
};

/** per_page=100 と X-WP-TotalPages を使い、上限なしで全件取得する。 */
const fetchAllStaticEntries = async (endpoint: string): Promise<StaticEntry[]> => {
  if (isWpMockMode()) {
    if (endpoint === 'posts') {
      return parseEntries(mockWpPostsList({ per_page: 100 }).map((post) => ({
        ...post,
        categories: post._embedded?.['wp:term']?.[0]?.flatMap((term) => {
          const category = mockWpGetCategories().find((entry) => entry.slug === term.slug);
          return category ? [category.id] : [];
        }),
      })));
    }
    if (endpoint === 'pages') return parseEntries(mockWpFetchPages({ per_page: 100 }));
    if (endpoint === 'categories') return parseEntries(mockWpGetCategories());
    return [];
  }
  if (!wpApiBaseUrl) throw new Error('WP_API_URL is required for detail SSG');
  const entries: StaticEntry[] = [];
  let totalPages = 1;
  let total = 0;
  for (let page = 1; page <= totalPages; page += 1) {
    const url = new URL(`${wpApiBaseUrl}/${endpoint}`);
    url.search = new URLSearchParams({
      per_page: '100', page: String(page), acf_format: 'standard',
      _fields: 'id,slug,parent,categories,link,acf.lang',
    }).toString();
    const response = await wpFetch(url);
    const pagesHeader = response.headers.get('X-WP-TotalPages');
    const totalHeader = response.headers.get('X-WP-Total');
    if (!pagesHeader || !totalHeader) throw new Error(`WP pagination headers missing: ${endpoint}`);
    totalPages = Number(pagesHeader);
    total = Number(totalHeader);
    if (!Number.isSafeInteger(totalPages) || totalPages < 0 || !Number.isSafeInteger(total) || total < 0) {
      throw new Error(`WP pagination headers invalid: ${endpoint}`);
    }
    entries.push(...parseEntries(await response.json()));
  }
  const unique = [...new Map(entries.map((entry) => [entry.id, entry])).values()];
  if (unique.length !== total) throw new Error(`WP collection changed or incomplete: ${endpoint}`);
  return unique;
};

/** 未設定ビルドでは取得失敗を警告し事前生成をスキップする。トークン登録後のビルドでは必ず中止する。 */
export const getAllStaticEntries = async (endpoint: string): Promise<StaticEntry[]> => {
  try {
    return await fetchAllStaticEntries(endpoint);
  } catch (error) {
    if (isStrictWpBuild()) throw error;
    console.warn(`[detail-ssg] ${endpoint}: WP取得失敗のため事前生成をスキップ（WP_BUILD_TOKEN未設定またはビルド外）`);
    return [];
  }
};

/** 共通CPTは両言語へ展開する。固定ルートと衝突するWPページは除く。 */
export const makeDetailStaticPaths = (endpoint: string): GetStaticPaths => async ({ locales }) => {
  const entries = await getAllStaticEntries(endpoint);
  const fixedSlugs = new Set(['about', 'contact', 'privacy-policy', 'top', 'search', 'featured', 'seasonal-reviews', 'seasonal-anime-and-dramas-reviews']);
  const filtered = entries.filter((entry) => endpoint !== 'pages' || !fixedSlugs.has(entry.slug));
  const paths = (locales ?? ['ja', 'en']).filter((locale) => locale !== 'default')
    .flatMap((locale) => filtered.map(({ slug }) => ({ params: { slug }, locale })));
  console.log(`[detail-ssg] ${endpoint}: ${entries.length} records / ${paths.length} paths`);
  return { paths, fallback: 'blocking' };
};

/** 記事のカテゴリと言語を正規URLに合わせ、他カテゴリ・他言語の404生成を避ける。 */
export const makePostStaticPaths = (type: PostType): GetStaticPaths => async ({ locales }) => {
  const posts = await getAllStaticEntries('posts');
  const categories = await getAllStaticEntries('categories');
  const categorySlugs = new Map(categories.map((category) => [category.id, category.slug]));
  const locs = locales ?? ['ja', 'en'];
  const paths = posts.flatMap((post) => {
    const lang = detectLang(post.link, Array.isArray(post.acf) ? undefined : post.acf?.lang);
    const category = categorySlugs.get(post.categories?.[0] ?? 0);
    if (!locs.includes(lang) || resolvePostType(category) !== type) return [];
    return [{ params: { slug: post.slug }, locale: lang }];
  });
  console.log(`[detail-ssg] ${type}: ${paths.length} paths`);
  return { paths, fallback: 'blocking' };
};

/** 季節CPTと移行前の子固定ページを両方列挙し、旧URLも同じデータで生成する。 */
export const seasonalDetailStaticPaths: GetStaticPaths = async ({ locales }) => {
  const reviews = await getAllStaticEntries('seasonal_review');
  const pages = await getAllStaticEntries('pages');
  const parent = pages.find((page) => page.slug === 'seasonal-anime-and-dramas-reviews');
  const children = pages.filter((page) => parent && page.parent === parent.id);
  const slugs = [...new Set([...reviews, ...children].map((entry) => entry.slug))];
  const paths = (locales ?? ['ja', 'en']).filter((locale) => locale !== 'default')
    .flatMap((locale) => slugs.map((slug) => ({ params: { slug }, locale })));
  console.log(`[detail-ssg] seasonal_review + legacy pages: ${paths.length} paths per route`);
  return { paths, fallback: 'blocking' };
};

/** サーバー生成時の時刻を日本時間の YYYY/MM/DD に固定する（blocking生成でも同じ処理）。 */
export const formatVodSnapshotDate = (date: Date = new Date()): string =>
  new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
