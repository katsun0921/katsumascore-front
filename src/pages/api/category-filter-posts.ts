/**
 * カテゴリ一覧ページのフィルタ用全記事一覧を CSR 向けに返す。
 * ISR では取得しない allPosts（FilterPost[]）と正確な totalPages を提供する。
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategoriesForArchiveResolve, getPostsWithMeta } from '@/libs/api/wordpress';
import { normalizePosts } from '@/utils/normalizePost';
import { CATEGORY_LIST_PER_PAGE } from '@/libs/listFilters';
import type { FilterPost } from '@/types/post';
import type { WPPost } from '@/types/wordpress';

export type CategoryFilterPostsResponse = {
  posts: FilterPost[];
  totalPages: number;
};

const FETCH_OPTIONS = { timeoutMs: 10000, maxRetries: 1 } as const;

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<CategoryFilterPostsResponse | { error: string }>,
) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { slug, locale, perPage: perPageParam } = req.query;
  if (typeof slug !== 'string' || typeof locale !== 'string') {
    res.status(400).json({ error: 'Missing slug or locale' });
    return;
  }

  const perPage =
    typeof perPageParam === 'string' && Number.isFinite(Number(perPageParam))
      ? Number.parseInt(perPageParam, 10)
      : CATEGORY_LIST_PER_PAGE;

  const categories = await getCategoriesForArchiveResolve(FETCH_OPTIONS);
  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  const currentLocale = locale === 'en' ? 'en' : 'ja';

  const first = await getPostsWithMeta(
    { category: category.id, page: 1, per_page: 100 },
    FETCH_OPTIONS,
  );
  if (!first) {
    res.status(503).json({ error: 'Failed to fetch posts' });
    return;
  }

  const rawTotalWpPages = Math.max(1, first.meta.totalPages);
  const rawPosts: WPPost[] = [...first.items];

  if (rawTotalWpPages > 1) {
    const remainingPages = Array.from({ length: rawTotalWpPages - 1 }, (_, i) => i + 2);
    const batches = await Promise.all(
      remainingPages.map((p) =>
        getPostsWithMeta({ category: category.id, page: p, per_page: 100 }, FETCH_OPTIONS),
      ),
    );
    for (const batch of batches) {
      if (batch) rawPosts.push(...batch.items);
    }
  }

  const normalizedPosts = normalizePosts(rawPosts, currentLocale);
  const totalPages = Math.max(1, Math.ceil(normalizedPosts.length / perPage));

  const posts: FilterPost[] = normalizedPosts.map(
    ({ id, slug: postSlug, score, publishedAt, vods, genres, tags }) => ({
      id,
      slug: postSlug,
      score: score ?? null,
      publishedAt,
      vods: vods ?? null,
      genres: genres ?? null,
      tags: tags ?? null,
    }),
  );

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
  res.status(200).json({ posts, totalPages });
};

export default handler;
