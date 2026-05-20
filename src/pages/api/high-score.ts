import type { NextApiRequest, NextApiResponse } from 'next';
import { getPosts, mapWPPostToPost } from '@/libs/api/wordpress';
import { pickRandom } from '@/libs/highscore';
import type { PickUpPost } from '@/components/features/PickUpAndScore/PickUpAndScore';

type ResponseData = PickUpPost[] | { error: string };

/**
 * スコア4以上の投稿からランダム5件を返す。ISR の Worker CPU 超過を避けるため CSR 専用エンドポイントとして分離。
 *
 * getPostsPagedMerge は OpenAPI クライアント経由のため acf_format=standard が付かず
 * acf.review_score が undefined になる。getPosts（生HTTP）を使い mapWPPostToPost 後の
 * score で判定することで正しくフィルタできる。
 */
const handler = async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
  const lang = req.query['lang'];
  const locale = lang === 'en' ? 'en' : 'ja';

  const all = await getPosts({ per_page: 100 });

  const posts = pickRandom(
    all
      .map((p) => mapWPPostToPost(p))
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .filter((m) => m.lang === locale)
      .filter((m) => (m.score ?? 0) >= 4)
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
