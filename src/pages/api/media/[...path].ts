/** `/media/*`（next.config の rewrites 経由）。WP の画像を秘密ヘッダー付きで取得して返す。cms のホスト名を公開側へ出さない。 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { toUploadsPath } from '@/libs/api/wordpress/mediaUrl';
import { withOriginSecret } from '@/libs/api/wordpress/originSecret';

const CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400';

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  // 成功が確定するまでは、404・502を含む応答をキャッシュしない。
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).end();
    return;
  }
  const raw = req.query.path;
  const uploadsPath = toUploadsPath(Array.isArray(raw) ? raw : raw ? [raw] : []);
  const base = process.env.WP_API_URL;
  if (!uploadsPath || !base) {
    res.status(404).end();
    return;
  }
  try {
    const origin = new URL(base).origin;
    const upstream = await fetch(`${origin}/wp-content/uploads/${uploadsPath}`, {
      method: 'GET',
      headers: withOriginSecret(new Headers()),
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
    });
    if (upstream.status === 404) {
      res.status(404).end();
      return;
    }
    const contentType = upstream.headers.get('content-type') ?? '';
    // 画像以外・非2xxは詳細を返さず502にする（URL・ヘッダーを漏らさない）
    if (!upstream.ok || !contentType.startsWith('image/')) {
      res.status(502).end();
      return;
    }
    // GETは本文を最後まで取得してから、成功時のキャッシュ設定を付ける。
    const body = req.method === 'HEAD' ? null : Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', CACHE_CONTROL);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method === 'HEAD') {
      res.status(200).end();
      return;
    }
    res.status(200).send(body);
  } catch {
    res.status(502).end();
  }
};

export default handler;
