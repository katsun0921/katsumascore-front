import type { NextApiRequest, NextApiResponse } from 'next';
import { getPosts, mapWPPostToPost } from '@/libs/api/wordpress';
import { pickRandom } from '@/libs/highscore';
import type { PickUpPost } from '@/components/features/PickUpAndScore/PickUpAndScore';

type ResponseData = PickUpPost[] | { error: string };

/**
 * per_page=100 は `_embed` 込みで約7MB・コールド約6〜7秒かかり、既定3秒では必ず失敗する。
 * `content` を落としても約4MB・約5.7秒で3秒には収まらず、かつ `WPPostSchema` の検証に
 * 落ちて全件パース失敗するため、フィールドは削らずタイムアウトを延長する
 */
const HIGH_SCORE_FETCH_OPTIONS = { timeoutMs: 15_000, maxRetries: 1 } as const;

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

  const all = await getPosts({ per_page: 100 }, HIGH_SCORE_FETCH_OPTIONS);

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

  // WP 取得失敗を空配列として 200 + 5分キャッシュで返すと、失敗が固定化して
  // 高スコア枠が空のままになる。取得できなかった場合はキャッシュせず 503 を返す
  if (all.length === 0) {
    console.error('[high-score] WP から記事を取得できなかったため 503 を返す');
    res.setHeader('Cache-Control', 'no-store');
    res.status(503).json({ error: 'failed to fetch posts' });
    return;
  }

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.status(200).json(posts);
};

export default handler;
