/**
 * 上映中の作品一覧（`/now-showing`）のクエリ解釈と、クライアント側の絞り込み・並べ替え。
 *
 * ページは上映中の全件を props で持つため、ソート・カテゴリ・タクソノミー・ページの
 * 切り替えは再取得なしでこの関数群だけで完結する。
 */
import { filterPostsByListFilter } from '@/libs/listFilters';
import type { Post } from '@/types/post';

/** 一覧のページあたり件数（カテゴリ一覧の `CATEGORY_LIST_PER_PAGE` と揃える）。 */
export const NOW_SHOWING_PER_PAGE = 13;

/**
 * ソート種別。既定は `release`（劇場公開日の新しい順）。
 * 「いま公開されたばかりの作品を上から見る」のが一覧の主目的のため、評価順を既定にしない。
 */
export type NowShowingSortFilter = 'release' | 'new' | 'score';

/** URL クエリから解釈した一覧の状態（ページ番号を除く）。 */
export type NowShowingQuery = {
  sort: NowShowingSortFilter;
  /** カテゴリスラッグ（`movie` / `anime` / `drama`） */
  category?: string;
  /** `genre` タクソノミーのスラッグ */
  genre?: string;
  /** `post_tag` のスラッグ */
  tag?: string;
};

type UrlParamValue = string | string[] | undefined;

export type NowShowingUrlParams = {
  filter?: UrlParamValue;
  category?: UrlParamValue;
  genre?: UrlParamValue;
  tag?: UrlParamValue;
  page?: UrlParamValue;
};

const CATEGORY_PREFIX = 'category:';
const GENRE_PREFIX = 'genre:';
const TAG_PREFIX = 'tag:';

/** フィルターチップの値（`category:movie`）を組み立てる。 */
export const createNowShowingCategoryFilterValue = (slug: string): string => `${CATEGORY_PREFIX}${slug}`;

/** フィルターチップの値（`genre:sci-fi`）を組み立てる。 */
export const createNowShowingGenreFilterValue = (slug: string): string => `${GENRE_PREFIX}${slug}`;

/** フィルターチップの値（`tag:marvel`）を組み立てる。 */
export const createNowShowingTagFilterValue = (slug: string): string => `${TAG_PREFIX}${slug}`;

/** `prefix` で始まる値からスラッグ部分を取り出す。形式が違えば `undefined`。 */
const getPrefixedSlug = (value: string, prefix: string): string | undefined => {
  if (!value.startsWith(prefix)) return undefined;
  const slug = value.slice(prefix.length);
  return slug.length > 0 ? slug : undefined;
};

/** Next.js の `query`（`string | string[] | undefined`）から先頭の非空文字列を1つ取り出す。 */
const getSingleUrlParamValue = (value: UrlParamValue): string | undefined => {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) return value[0];
  return undefined;
};

/** `filter` クエリの値をソート種別として解釈する。未指定・不正値は `release`。 */
const toSortFilter = (value: string | undefined): NowShowingSortFilter => {
  if (value === 'new' || value === 'score') return value;
  return 'release';
};

/** URL クエリから一覧の状態を組み立てる。`genre` と `tag` は `genre` を優先する（同時指定は不可）。 */
export const getNowShowingQueryFromUrlParams = (params?: NowShowingUrlParams): NowShowingQuery => {
  const genre = getSingleUrlParamValue(params?.genre);
  const tag = getSingleUrlParamValue(params?.tag);
  return {
    sort: toSortFilter(getSingleUrlParamValue(params?.filter)),
    ...(getSingleUrlParamValue(params?.category) !== undefined
      ? { category: getSingleUrlParamValue(params?.category) }
      : {}),
    ...(genre !== undefined ? { genre } : {}),
    ...(genre === undefined && tag !== undefined ? { tag } : {}),
  };
};

/** URL の `page` クエリを 1 以上の整数にする。未指定・不正値は 1。 */
export const getNowShowingPageFromUrlParams = (params?: NowShowingUrlParams): number => {
  const raw = getSingleUrlParamValue(params?.page);
  const page = raw !== undefined ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(page) && page >= 1 ? page : 1;
};

/** フィルターチップのアクティブ表示に使う値の配列（ソート＋カテゴリ＋ジャンル or タグ）。 */
export const getActiveNowShowingFilterValues = (query: NowShowingQuery): string[] => [
  query.sort,
  ...(query.category !== undefined ? [createNowShowingCategoryFilterValue(query.category)] : []),
  ...(query.genre !== undefined ? [createNowShowingGenreFilterValue(query.genre)] : []),
  ...(query.tag !== undefined ? [createNowShowingTagFilterValue(query.tag)] : []),
];

/**
 * チップを1つ押したあとの状態を返す。
 * ソートは差し替え、カテゴリ・ジャンル・タグは同じ値を再度押すと解除する。
 * ジャンルとタグは同時指定できないため、片方を選ぶともう片方は外す。
 */
export const applyNowShowingFilterValue = (query: NowShowingQuery, value: string): NowShowingQuery => {
  if (value === 'release' || value === 'new' || value === 'score') return { ...query, sort: value };

  const category = getPrefixedSlug(value, CATEGORY_PREFIX);
  if (category !== undefined) {
    const { category: current, ...rest } = query;
    return current === category ? rest : { ...rest, category };
  }

  const genre = getPrefixedSlug(value, GENRE_PREFIX);
  if (genre !== undefined) {
    const { genre: currentGenre, tag: _tag, ...rest } = query;
    void _tag;
    return currentGenre === genre ? rest : { ...rest, genre };
  }

  const tag = getPrefixedSlug(value, TAG_PREFIX);
  if (tag !== undefined) {
    const { tag: currentTag, genre: _genre, ...rest } = query;
    void _genre;
    return currentTag === tag ? rest : { ...rest, tag };
  }

  return query;
};

/** 一覧の状態を URL クエリの形（`getNowShowingUrl` の引数）へ変換する。既定値（`release`）は落とす。 */
export const nowShowingQueryToUrlParams = (
  query: NowShowingQuery,
  page = 1,
): { filter?: string; category?: string; genre?: string; tag?: string; page?: number } => ({
  ...(query.sort !== 'release' ? { filter: query.sort } : {}),
  ...(query.category !== undefined ? { category: query.category } : {}),
  ...(query.genre !== undefined ? { genre: query.genre } : {}),
  ...(query.tag !== undefined ? { tag: query.tag } : {}),
  ...(page > 1 ? { page } : {}),
});

/**
 * 上映中の記事一覧に、カテゴリ・タクソノミーの絞り込みとソートを適用する。
 * `release` は WP から受け取った並び（劇場公開日の新しい順）をそのまま使うため並べ替えない。
 *
 * @param posts — WP から `filter=release` で取得した全件（並び順を保っていること）。
 */
export const filterNowShowingPosts = (posts: Post[], query: NowShowingQuery): Post[] => {
  const byCategory = query.category
    ? posts.filter((post) => post.category === query.category)
    : posts;
  const byGenre = query.genre
    ? filterPostsByListFilter(byCategory, createNowShowingGenreFilterValue(query.genre))
    : byCategory;
  const byTag = query.tag
    ? filterPostsByListFilter(byGenre, createNowShowingTagFilterValue(query.tag))
    : byGenre;
  if (query.sort === 'release') return byTag;
  return filterPostsByListFilter(byTag, query.sort);
};
