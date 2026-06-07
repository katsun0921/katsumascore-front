import type { NextApiRequest, NextApiResponse } from 'next';
import { getPosts, mapWPPostToPost } from '@/libs/api/wordpress';
import { pickRandom } from '@/libs/highscore';
import type { Post } from '@/types/post';

type ResponseData = Post[] | { error: string };

/** VOD ターム ID に紐づく関連記事をランダム3件返す。ISR の Worker CPU 超過を避けるため CSR 専用エンドポイントとして分離。 */
const handler = async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
  const { termId, excludeId, lang } = req.query;

  if (typeof termId !== 'string' || !/^\d+$/.test(termId)) {
    res.status(400).json({ error: 'invalid termId' });
    return;
  }

  const vodTermId = Number(termId);
  const excludePostId = typeof excludeId === 'string' ? Number(excludeId) : undefined;
  const locale = typeof lang === 'string' ? lang : 'ja';

  const raw = await getPosts({ per_page: 12, vod: vodTermId });

  const mapped = raw
    .filter((p) => p.id !== excludePostId)
    .map((p) => mapWPPostToPost(p))
    .filter((m): m is NonNullable<typeof m> => m !== null && m.lang === locale)
    .map(({ content: _c, ...rest }) => {
      void _c;
      return rest as Post;
    });

  const posts = pickRandom(mapped, 3);

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.status(200).json(posts);
};

export default handler;
