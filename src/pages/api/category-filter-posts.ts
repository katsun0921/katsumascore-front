/**
 * カテゴリ一覧ページのフィルタ・ページネーション済み投稿を CSR 向けに返す。
 * filter / page 指定時は Post[]（表示用フルデータ）を、未指定時は FilterPost[]（フィルタ選択肢用）を返す。
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategoriesForArchiveResolve, getPostsWithMeta } from '@/libs/api/wordpress';
import { normalizePosts } from '@/utils/normalizePost';
import {
  CATEGORY_LIST_PER_PAGE,
  filterPostsByListFilters,
  getSortFilterFromUrlParams,
  getTaxonomyFilterFromUrlParams,
  paginatePosts,
} from '@/libs/listFilters';
import type { FilterPost, Post } from '@/types/post';
import type { WPPost } from '@/types/wordpress';

export type CategoryFilterPostsResponse = {
  posts: FilterPost[];
  totalPages: number;
};

export type CategoryPagedPostsResponse = {
  posts: Post[];
  filterPosts: FilterPost[];
  totalPages: number;
};

const FETCH_OPTIONS = { timeoutMs: 10000, maxRetries: 1 } as const;

/** WP から全件取得して正規化した Post[] を返す内部ヘルパー。 */
const fetchAllNormalizedPosts = async (
  categoryId: number,
  locale: 'ja' | 'en',
): Promise<Post[] | null> => {
  const first = await getPostsWithMeta(
    { category: categoryId, page: 1, per_page: 100 },
    FETCH_OPTIONS,
  );
  if (!first) return null;

  const rawPosts: WPPost[] = [...first.items];
  const rawTotalWpPages = Math.max(1, first.meta.totalPages);

  if (rawTotalWpPages > 1) {
    const remainingPages = Array.from({ length: rawTotalWpPages - 1 }, (_, i) => i + 2);
    const batches = await Promise.all(
      remainingPages.map((p) =>
        getPostsWithMeta({ category: categoryId, page: p, per_page: 100 }, FETCH_OPTIONS),
      ),
    );
    for (const batch of batches) {
      if (batch) rawPosts.push(...batch.items);
    }
  }

  return normalizePosts(rawPosts, locale);
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

  const categories = await getCategoriesForArchiveResolve(FETCH_OPTIONS);
  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  const normalizedPosts = await fetchAllNormalizedPosts(category.id, currentLocale);
  if (!normalizedPosts) {
    res.status(503).json({ error: 'Failed to fetch posts' });
    return;
  }

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');

  // page / filter 指定あり → フィルタ・ページネーション済みの Post[] を返す
  const requestedPage = typeof pageParam === 'string' ? Number.parseInt(pageParam, 10) : undefined;
  if (requestedPage !== undefined && Number.isFinite(requestedPage)) {
    const sortFilter = getSortFilterFromUrlParams({ filter, genre, tag });
    const taxonomyFilter = getTaxonomyFilterFromUrlParams({ filter, genre, tag });
    const filteredPosts = filterPostsByListFilters(normalizedPosts, { sortFilter, taxonomyFilter });
    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / perPage));
    const safePage = Math.min(Math.max(1, requestedPage), totalPages);
    const pagedPosts = paginatePosts(filteredPosts, safePage, perPage);

    const filterPosts: FilterPost[] = normalizedPosts.map(
      ({ id, slug: postSlug, score, publishedAt, vods, genres, tags: postTags }) => ({
        id,
        slug: postSlug,
        score: score ?? null,
        publishedAt,
        vods: vods ?? null,
        genres: genres ?? null,
        tags: postTags ?? null,
      }),
    );

    const response: CategoryPagedPostsResponse = {
      posts: pagedPosts,
      filterPosts,
      totalPages,
    };
    res.status(200).json(response);
    return;
  }

  // page 未指定 → フィルタ選択肢用の FilterPost[] を返す（後方互換）
  const totalPages = Math.max(1, Math.ceil(normalizedPosts.length / perPage));
  const posts: FilterPost[] = normalizedPosts.map(
    ({ id, slug: postSlug, score, publishedAt, vods, genres, tags: postTags }) => ({
      id,
      slug: postSlug,
      score: score ?? null,
      publishedAt,
      vods: vods ?? null,
      genres: genres ?? null,
      tags: postTags ?? null,
    }),
  );

  const response: CategoryFilterPostsResponse = { posts, totalPages };
  res.status(200).json(response);
};

export default handler;
