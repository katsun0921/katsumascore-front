import type { NextApiRequest, NextApiResponse } from 'next';
import { getPostsByPersonId } from '@/libs/api/wordpress';
import { getPostUrl, normalizeRouteLocale, resolvePostType } from '@/libs/route';

type OtherWork = { title: string; href: string; score?: number };

type ResponseData = OtherWork[] | { error: string };

const handler = async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
  const { personId, excludeId, locale } = req.query;

  if (typeof personId !== 'string' || !/^\d+$/.test(personId)) {
    res.status(400).json({ error: 'invalid personId' });
    return;
  }

  const id = Number(personId);
  const excludePostId = typeof excludeId === 'string' ? Number(excludeId) : undefined;
  const loc = normalizeRouteLocale(typeof locale === 'string' ? locale : undefined);

  const related = await getPostsByPersonId({ personId: id, lang: loc, perPage: 6 });

  const works = (related?.items ?? [])
    .filter((item) => item.id !== excludePostId)
    .slice(0, 5)
    .map((item) => ({
      title: item.title,
      href: getPostUrl(resolvePostType(item.categorySlug ?? undefined), item.slug, loc),
      ...(item.score !== null ? { score: item.score } : {}),
    }));

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.status(200).json(works);
};

export default handler;
