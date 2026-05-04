import type { NextApiRequest, NextApiResponse } from 'next';
import { mapWPPostToPost, searchPosts } from '@/libs/api/wordpress';
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

  const raw = await searchPosts(q.trim(), lang === 'en' ? 'en' : 'ja');
  const dim = isSearchDimension(dimension) ? dimension : 'all';
  const prepared = prepareSearchResults(raw, q, dim);

  const posts = prepared
    .map(({ wp }) => mapWPPostToPost(wp))
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .map(({ content: unusedContent, ...rest }) => {
      void unusedContent;
      return rest as Post;
    });

  res.setHeader('Cache-Control', 'private, no-cache');
  res.status(200).json(posts);
};

export default handler;
