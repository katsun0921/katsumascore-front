/**
 * 一覧ページのクエリ（`filter` / `genre` / `tag`）と、UI・クライアント側で使う
 * フィルター値文字列の相互変換、および投稿配列の絞り込み・ページングをまとめる。
 */
import type { Post, PostTaxonomy } from '@/types/post';

export type ListFilterOption = {
  label: string;
  value: string;
  href?: string;
};

type TaxonomyFilterType = 'genre' | 'tag';
type StableFilterValue = 'score' | 'new' | 'streaming';
type UrlParamValue = string | string[] | undefined;
type ListUrlParams = {
  filter?: UrlParamValue;
  genre?: UrlParamValue;
  tag?: UrlParamValue;
};

const TAXONOMY_FILTER_SEPARATOR = ':';

/** ジャンル・タグなどのタクソノミーを、一覧フィルター用の `genre:slug` / `tag:slug` 形式の文字列にする。 */
export const createTaxonomyFilterValue = (type: TaxonomyFilterType, slug: string): string =>
  `${type}${TAXONOMY_FILTER_SEPARATOR}${slug}`;

/** `createTaxonomyFilterValue` で組み立てた値から、コロン以降のスラッグだけを取り出す。形式が合わなければ `undefined`。 */
const getTaxonomyFilterSlug = (value: string, type: TaxonomyFilterType): string | undefined => {
  const prefix = createTaxonomyFilterValue(type, '');
  if (!value.startsWith(prefix)) return undefined;
  const slug = value.slice(prefix.length);
  return slug.length > 0 ? slug : undefined;
};

/** Next.js の `query` など（`string | string[] | undefined`）から、先頭の非空文字列を1つ取り出す。 */
const getSingleUrlParamValue = (value: UrlParamValue): string | undefined => {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) return value[0];
  return undefined;
};

/** URL の `filter` クエリからソート種別（スコア順・新着・配信中）を解釈する。未指定や不正値はスコア順扱い。 */
export const getSortFilterFromUrlParams = (params?: ListUrlParams): StableFilterValue => {
  const filter = getSingleUrlParamValue(params?.filter);
  if (filter === 'new' || filter === 'streaming') return filter;
  return 'score';
};

/** URL の `genre` または `tag` クエリを、内部のタクソノミーフィルター文字列（`genre:…` / `tag:…`）に変換する。`genre` を優先。 */
export const getTaxonomyFilterFromUrlParams = (params?: ListUrlParams): string | undefined => {
  const genre = getSingleUrlParamValue(params?.genre);
  if (genre !== undefined) return createTaxonomyFilterValue('genre', genre);

  const tag = getSingleUrlParamValue(params?.tag);
  if (tag !== undefined) return createTaxonomyFilterValue('tag', tag);

  return undefined;
};

/** 一覧の「現在のフィルター」として使う単一の値。タクソノミー指定があればそれを、なければソート種別を返す。 */
export const getListFilterFromUrlParams = (params?: ListUrlParams): string =>
  getTaxonomyFilterFromUrlParams(params) ?? getSortFilterFromUrlParams(params);

/** タクソノミー指定時はソート値とタクソノミー値の両方、それ以外はソート値のみの配列。複数チップの同時アクティブ表示などに使う。 */
export const getActiveListFilterValuesFromUrlParams = (params?: ListUrlParams): string[] => {
  const taxonomyFilter = getTaxonomyFilterFromUrlParams(params);
  if (taxonomyFilter !== undefined) return [getSortFilterFromUrlParams(params), taxonomyFilter];
  return [getSortFilterFromUrlParams(params)];
};

/** 内部のフィルター文字列を、ルーター用のクエリオブジェクト（`filter` / `genre` / `tag` のいずれか）に戻す。解釈できない場合は `undefined`。 */
export const getUrlParamsFromListFilter = (filter: string): { filter?: StableFilterValue; genre?: string; tag?: string } | undefined => {
  const genre = getTaxonomyFilterSlug(filter, 'genre');
  if (genre !== undefined) return { genre };

  const tag = getTaxonomyFilterSlug(filter, 'tag');
  if (tag !== undefined) return { tag };

  if (filter === 'new' || filter === 'streaming') return { filter };

  return undefined;
};

/** 投稿が、指定スラッグのタクソノミー（ジャンルまたはタグ）を少なくとも1つ持つか。 */
const hasTaxonomySlug = (items: PostTaxonomy[] | undefined, slug: string): boolean =>
  items?.some((item) => item.slug === slug) ?? false;

/** 1つのフィルター値に応じて投稿を並べ替え、またはタクソノミー・配信有無で絞り込む。元配列は変更しない（ソート時はコピー）。 */
export const filterPostsByListFilter = (posts: Post[], filter: string): Post[] => {
  if (filter === 'score') return [...posts].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  if (filter === 'new') return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  if (filter === 'streaming') return posts.filter((post) => (post.vods?.length ?? 0) > 0);

  const genreSlug = getTaxonomyFilterSlug(filter, 'genre');
  if (genreSlug !== undefined) return posts.filter((post) => hasTaxonomySlug(post.genres, genreSlug));

  const tagSlug = getTaxonomyFilterSlug(filter, 'tag');
  if (tagSlug !== undefined) return posts.filter((post) => hasTaxonomySlug(post.tags, tagSlug));

  return posts;
};

/** ソート用フィルターとタクソノミー用フィルターを順に適用する。タクソノミーが無い場合はソートのみ。 */
export const filterPostsByListFilters = (
  posts: Post[],
  filters: { sortFilter: StableFilterValue; taxonomyFilter?: string },
): Post[] => {
  const taxonomyFilteredPosts = filters.taxonomyFilter
    ? filterPostsByListFilter(posts, filters.taxonomyFilter)
    : posts;
  return filterPostsByListFilter(taxonomyFilteredPosts, filters.sortFilter);
};

/** 1 始まりのページ番号とページあたり件数で、`posts` の該当スライスを返す。不正なページ番号は 1 ページ目として扱う。 */
export const paginatePosts = (posts: Post[], page: number, perPage: number): Post[] => {
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const start = (safePage - 1) * perPage;
  return posts.slice(start, start + perPage);
};

/** 投稿集合から、指定種別のタクソノミーを重複なく走査し、`ListFilterOption` の配列にする。 */
const collectTaxonomyFilterOptions = (
  posts: Post[],
  type: TaxonomyFilterType,
  labelPrefix: string,
): ListFilterOption[] => {
  const seen = new Set<string>();
  const options: ListFilterOption[] = [];

  for (const post of posts) {
    const items = type === 'genre' ? post.genres : post.tags;
    if (!items) continue;

    for (const item of items) {
      if (seen.has(item.slug)) continue;
      seen.add(item.slug);
      options.push({
        label: `${labelPrefix}: ${item.name}`,
        value: createTaxonomyFilterValue(type, item.slug),
      });
    }
  }

  return options;
};

/** ジャンル・タグのフィルター候補を、ラベル接頭辞付きで1本の配列にまとめて返す（UI のセレクト等向け）。 */
export const getPostTaxonomyFilterOptions = (
  posts: Post[],
  labels: { genre: string; tag: string },
): ListFilterOption[] => [
  ...collectTaxonomyFilterOptions(posts, 'genre', labels.genre),
  ...collectTaxonomyFilterOptions(posts, 'tag', labels.tag),
];

/** ジャンル行・タグ行を別配列にした 2 次元配列。空の行は除く（行ごとの UI 向け）。 */
export const getPostTaxonomyFilterOptionRows = (
  posts: Post[],
  labels: { genre: string; tag: string },
): ListFilterOption[][] => [
  collectTaxonomyFilterOptions(posts, 'genre', labels.genre),
  collectTaxonomyFilterOptions(posts, 'tag', labels.tag),
].filter((row) => row.length > 0);
