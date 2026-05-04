// On-demand ISR: POST only。WordPress 等から本 URL を叩いて静的ページを再生成する。
// slug クエリが指定された場合は Cloudflare Edge Cache も同時にパージする。
import type { NextApiRequest, NextApiResponse } from 'next';
import { NORMALIZE_VERSION } from '@/libs/cache/version';

type RevalidateBody = {
  path?: unknown
  paths?: unknown
  slug?: unknown
}

type RevalidateOk = {
  ok: true
  paths: string[]
}

type RevalidateErr = {
  ok: false
  message: string
  path?: string
  detail?: string
}

/** Authorization ヘッダ・クエリからシークレットを読み取る */
const readSecret = (req: NextApiRequest): string | undefined => {
  const bearer = req.headers.authorization;
  if (typeof bearer === 'string' && bearer.startsWith('Bearer ')) {
    return bearer.slice('Bearer '.length).trim();
  }
  const header = req.headers['x-revalidate-secret'];
  if (typeof header === 'string') return header.trim();
  const q = req.query.secret;
  if (typeof q === 'string') return q.trim();
  return undefined;
};

/** クエリ・ボディから再生成対象パスを収集し重複を排除する */
const collectPaths = (req: NextApiRequest, body: RevalidateBody): string[] => {
  const out: string[] = [];
  const qPath = req.query.path;
  if (typeof qPath === 'string' && qPath.trim().length > 0) {
    out.push(qPath.trim());
  }
  if (typeof body.path === 'string' && body.path.trim().length > 0) {
    out.push(body.path.trim());
  }
  if (Array.isArray(body.paths)) {
    for (const p of body.paths) {
      if (typeof p === 'string' && p.trim().length > 0) {
        out.push(p.trim());
      }
    }
  }
  return [...new Set(out)];
};

/**
 * Cloudflare Cache Purge API を呼び出す。
 * 30 URL / リクエスト制限があるため、超過分は分割して送信する。
 */
const purgeCloudflare = async (urls: string[]): Promise<void> => {
  const zoneId = process.env.CF_ZONE_ID;
  const token = process.env.CF_API_TOKEN;
  if (!zoneId || !token) return;

  const CHUNK = 30;
  for (let i = 0; i < urls.length; i += CHUNK) {
    const chunk = urls.slice(i, i + CHUNK);
    await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: chunk }),
      }
    );
  }
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<RevalidateOk | RevalidateErr>
) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' });
  }

  const expected = process.env.REVALIDATE_SECRET?.trim();
  if (!expected) {
    return res
      .status(503)
      .json({ ok: false, message: 'REVALIDATE_SECRET is not configured' });
  }

  const secret = readSecret(req);
  if (secret !== expected) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }

  const body: RevalidateBody =
    req.body !== null && typeof req.body === 'object'
      ? (req.body as RevalidateBody)
      : {};

  const paths = collectPaths(req, body);
  if (paths.length === 0) {
    return res.status(400).json({
      ok: false,
      message:
        'Provide path: query ?path= or JSON body { path } / { paths }',
    });
  }

  for (const path of paths) {
    try {
      await res.revalidate(path);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      return res
        .status(500)
        .json({ ok: false, message: 'Revalidate failed', path, detail });
    }
  }

  // slug が渡された場合は Cloudflare Edge も同時にパージする
  const slug =
    typeof req.query.slug === 'string'
      ? req.query.slug
      : typeof body.slug === 'string'
        ? body.slug
        : null;

  if (slug) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog';
    await purgeCloudflare([
      `${origin}/posts/${slug}`,
      `${origin}/`,
    ]);
  }

  res.setHeader('x-normalize-version', NORMALIZE_VERSION);
  return res.status(200).json({ ok: true, paths });
};

export default handler;
