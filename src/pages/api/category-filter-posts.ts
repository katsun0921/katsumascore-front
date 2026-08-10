/**
 * カテゴリ一覧ページのフィルタ・ページネーション済み投稿を CSR 向けに返す。
 * filter / page 指定時は Post[]（表示用フルデータ）を、未指定時は FilterPost[]（フィルタ選択肢用）を返す。
 *
 * 絞り込み・ソート・ページングは WP のカスタムエンドポイント（`/v1/category-list`）が
 * SQL で行う。以前は WP から全記事（映画は466件）を取得してメモリ上で処理しており
 * 実測約6.4秒かかっていた。
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategoryList } from '@/libs/api/wordpress';
import type { CategoryListFilter, CategoryListFilterOptions } from '@/libs/api/wordpress';
import {
  CATEGORY_LIST_PER_PAGE,
  getSortFilterFromUrlParams,
  getTaxonomyFilterFromUrlParams,
} from '@/libs/listFilters';
import { categoryListItemToPost } from '@/utils/categoryListItemToPost';
import type { FilterPost, Post } from '@/types/post';

export type CategoryFilterPostsResponse = {
  posts: FilterPost[];
  totalPages: number;
};

export type CategoryPagedPostsResponse = {
  posts: Post[];
  filterPosts: FilterPost[];
  totalPages: number;
};

/** 1ページ分のみの取得になったため、従来の10秒から既定（3秒）に戻せる余地はあるが、
 *  コールド時の余裕を見て5秒とする（実測: コールド 0.66〜1.24秒） */
const FETCH_OPTIONS = { timeoutMs: 5000, maxRetries: 1 } as const;

/** `genre:xxx` / `tag:xxx` 形式のタクソノミーフィルタを、WP へ渡すクエリへ分解する。 */
const splitTaxonomyFilter = (taxonomyFilter?: string): { genre?: string; tag?: string } => {
  if (!taxonomyFilter) return {};
  const [type, ...rest] = taxonomyFilter.split(':');
  const slug = rest.join(':');
  if (slug.length === 0) return {};
  if (type === 'genre') return { genre: slug };
  if (type === 'tag') return { tag: slug };
  return {};
};


/**
 * フィルタ選択肢用の `FilterPost[]` を組み立てる。
 *
 * UI（`getPostTaxonomyFilterOptionRows`）は投稿配列を走査して
 * genre / tag の選択肢を作るため、選択肢と同じ形の擬似的な投稿を1件ずつ用意する。
 * 全記事を取得しなくても選択肢を出せるようにするための変換で、
 * これらは表示には使われない。
 */
const toFilterOptionPosts = (options: CategoryListFilterOptions): FilterPost[] => {
  const posts: FilterPost[] = [];
  options.genres.forEach((genre, index) => {
    posts.push({
      id: `filter-genre-${index}`,
      slug: '',
      publishedAt: '',
      genres: [{ name: genre.name, slug: genre.slug }],
    });
  });
  options.tags.forEach((tag, index) => {
    posts.push({
      id: `filter-tag-${index}`,
      slug: '',
      publishedAt: '',
      tags: [{ name: tag.name, slug: tag.slug }],
    });
  });
  return posts;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<CategoryFilterPostsResponse | CategoryPagedPostsResponse | { error: string }>,
) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { slug, locale, perPage: perPageParam, page: pageParam, filter, genre, tag } = req.query;
  if (typeof slug !== 'string' || typeof locale !== 'string') {
    res.status(400).json({ error: 'Missing slug or locale' });
    return;
  }

  const perPage =
    typeof perPageParam === 'string' && Number.isFinite(Number(perPageParam))
      ? Number.parseInt(perPageParam, 10)
      : CATEGORY_LIST_PER_PAGE;

  const currentLocale = locale === 'en' ? 'en' : 'ja';
  const sortFilter = getSortFilterFromUrlParams({ filter, genre, tag });
  const taxonomyFilter = getTaxonomyFilterFromUrlParams({ filter, genre, tag });
  const { genre: genreSlug, tag: tagSlug } = splitTaxonomyFilter(taxonomyFilter);

  const requestedPage = typeof pageParam === 'string' ? Number.parseInt(pageParam, 10) : undefined;
  const hasPage = requestedPage !== undefined && Number.isFinite(requestedPage);

  const result = await getCategoryList(
    {
      category: slug,
      lang: currentLocale,
      page: hasPage ? Math.max(1, requestedPage) : 1,
      perPage,
      filter: sortFilter as CategoryListFilter,
      ...(genreSlug !== undefined ? { genre: genreSlug } : {}),
      ...(tagSlug !== undefined ? { tag: tagSlug } : {}),
    },
    FETCH_OPTIONS,
  );

  if (!result) {
    console.error(`[category-filter-posts] WP から取得できなかった（slug=${slug} locale=${currentLocale}）`);
    res.setHeader('Cache-Control', 'no-store');
    res.status(503).json({ error: 'Failed to fetch posts' });
    return;
  }

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');

  const filterPosts = toFilterOptionPosts(result.filterOptions);

  // page / filter 指定あり → フィルタ・ページネーション済みの Post[] を返す
  if (hasPage) {
    const response: CategoryPagedPostsResponse = {
      posts: result.items.map((item) => categoryListItemToPost(item, currentLocale)),
      filterPosts,
      totalPages: Math.max(1, result.meta.totalPages),
    };
    res.status(200).json(response);
    return;
  }

  // page 未指定 → フィルタ選択肢用の FilterPost[] を返す（後方互換）
  res.status(200).json({
    posts: filterPosts,
    totalPages: Math.max(1, result.meta.totalPages),
  });
};

export default handler;
