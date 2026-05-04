import type { NextApiRequest, NextApiResponse } from 'next';
import { mapWPPostToPost } from '@/libs/api/wordpress';
import { prepareSearchResults, type SearchDimensionFilter } from '@/libs/searchRelevance';
import type { Post } from '@/types/post';

const VALID_DIMENSIONS: SearchDimensionFilter[] = ['all', 'actor', 'director', 'genre'];

const isSearchDimension = (v: unknown): v is SearchDimensionFilter =>
  typeof v === 'string' && VALID_DIMENSIONS.includes(v as SearchDimensionFilter);

const handler = async (req: NextApiRequest, res: NextApiResponse<Post[]>) => {
  const { q, lang = 'ja', dimension } = req.query;
  if (typeof q !== 'string' || !q.trim()) {
    res.status(200).json([]);
    return;
  }

  const base = process.env.WP_API_URL?.replace(/\/+$/, '');
  if (!base) {
    res.status(500).json([]);
    return;
  }

  const url = `${base}/posts?search=${encodeURIComponent(q)}&lang=${lang}&_embed&acf_format=standard&per_page=20`;
  const wpRes = await fetch(url);
  if (!wpRes.ok) {
    res.status(wpRes.status).json([]);
    return;
  }

  const raw: unknown[] = await wpRes.json();
  const dim = isSearchDimension(dimension) ? dimension : 'all';
  const prepared = prepareSearchResults(raw, q, dim);

  const posts = prepared
    .map(({ wp }) => mapWPPostToPost(wp))
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .map(({ content: _, ...rest }) => rest as Post);

  res.setHeader('Cache-Control', 'private, no-cache');
  res.status(200).json(posts);
};

export default handler;
