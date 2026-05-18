import type { NextApiRequest, NextApiResponse } from 'next';
import { getPostsByActorTermId, getPostsByPersonTermId, mapWPPostToPost } from '@/libs/api/wordpress';

type OtherWork = { title: string; href: string; score?: number };

type ResponseData = OtherWork[] | { error: string };

const handler = async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
  const { termId, taxType, excludeId } = req.query;

  if (typeof termId !== 'string' || !/^\d+$/.test(termId)) {
    res.status(400).json({ error: 'invalid termId' });
    return;
  }
  if (taxType !== 'actor' && taxType !== 'person') {
    res.status(400).json({ error: 'invalid taxType' });
    return;
  }

  const id = Number(termId);
  const excludePostId = typeof excludeId === 'string' ? Number(excludeId) : undefined;

  const raw =
    taxType === 'actor'
      ? await getPostsByActorTermId(id)
      : await getPostsByPersonTermId(id);

  const works = raw
    .filter((p) => p.id !== excludePostId)
    .slice(0, 5)
    .map((p) => {
      const m = mapWPPostToPost(p);
      if (!m) return null;
      return {
        title: m.title,
        href: m.slug,
        ...(m.score !== undefined ? { score: m.score } : {}),
      };
    })
    .filter((w): w is OtherWork => w !== null);

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.status(200).json(works);
};

export default handler;
