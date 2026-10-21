/**
 * SSG 凍結モード中に、実行時に WordPress を呼ぶ API ルートを停止させるラッパー。
 * 凍結時は WP へ一切アクセスせず 503 + `{ maintenance: true }` を返す。
 */
import type { NextApiHandler } from 'next';
import { isSsgFreeze } from './ssgFreeze';

export type MaintenanceBody = { maintenance: true };

/**
 * API ハンドラを凍結モード対応にする。
 *
 * @param handler 通常時に実行するハンドラ
 */
export const withFreezeGuard =
  <T>(handler: NextApiHandler<T>): NextApiHandler<T | MaintenanceBody> =>
  async (req, res) => {
    if (isSsgFreeze()) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(503).json({ maintenance: true });
      return;
    }
    await handler(req, res);
  };
