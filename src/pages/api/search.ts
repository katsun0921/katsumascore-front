import type { NextApiRequest, NextApiResponse } from 'next';
import { mapWPPostToPost, searchPosts } from '@/libs/api/wordpress';
import { prepareSearchResults, type SearchDimensionFilter } from '@/libs/searchRelevance';
import type { Locale } from '@/i18n/t';
import type { Post } from '@/types/post';

const VALID_DIMENSIONS: SearchDimensionFilter[] = ['all', 'actor', 'director', 'genre'];
const VALID_LOCALES: Locale[] = ['ja', 'en'];

const isSearchDimension = (v: unknown): v is SearchDimensionFilter =>
  typeof v === 'string' && VALID_DIMENSIONS.includes(v as SearchDimensionFilter);

const isLocale = (v: unknown): v is Locale =>
  typeof v === 'string' && VALID_LOCALES.includes(v as Locale);

const handler = async (req: NextApiRequest, res: NextApiResponse<Post[]>) => {
  const { q, dimension, lang } = req.query;
  if (typeof q !== 'string' || !q.trim()) {
    res.status(200).json([]);
    return;
  }

  const locale: Locale = isLocale(lang) ? lang : 'ja';
  const raw = await searchPosts(q.trim());
  const dim = isSearchDimension(dimension) ? dimension : 'all';
  const prepared = prepareSearchResults(raw, q, dim);

  const posts = prepared
    .map(({ wp }) => mapWPPostToPost(wp))
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .filter((m) => !m.lang || m.lang === locale)
    .map(({ content: unusedContent, ...rest }) => {
      void unusedContent;
      return rest as Post;
    });

  res.setHeader('Cache-Control', 'private, no-cache');
  res.status(200).json(posts);
};

export default handler;
