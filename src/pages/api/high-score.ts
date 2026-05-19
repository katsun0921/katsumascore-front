import type { NextApiRequest, NextApiResponse } from 'next';
import { getPostsPagedMerge, mapWPPostToPost } from '@/libs/api/wordpress';
import { pickRandom } from '@/libs/highscore';
import type { PickUpPost } from '@/components/features/PickUpAndScore/PickUpAndScore';

type ResponseData = PickUpPost[] | { error: string };

/** スコア4以上の投稿からランダム5件を返す。ISR の Worker CPU 超過を避けるため CSR 専用エンドポイントとして分離。 */
const handler = async (_req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
  const all = await getPostsPagedMerge({ per_page: 100 }, 1);

  const posts = pickRandom(
    all
      .filter((p) => (p.acf?.review_score ?? 0) >= 4)
      .map((p) => mapWPPostToPost(p))
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .map((m) => ({
        slug: m.slug,
        title: m.title,
        ...(m.image ? { thumbnailUrl: m.image } : {}),
        ...(m.score !== undefined ? { score: m.score } : {}),
      })),
    5,
  );

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.status(200).json(posts);
};

export default handler;
