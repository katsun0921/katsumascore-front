// On-demand ISR: POST only. WordPress 等から本 URL を叩いて静的ページを再生成する。
import type { NextApiRequest, NextApiResponse } from "next";

type RevalidateBody = {
  path?: unknown;
  paths?: unknown;
};

type RevalidateOk = {
  ok: true;
  paths: string[];
};

type RevalidateErr = {
  ok: false;
  message: string;
  path?: string;
  detail?: string;
};

const readSecret = (req: NextApiRequest): string | undefined => {
  const bearer = req.headers.authorization;
  if (typeof bearer === "string" && bearer.startsWith("Bearer ")) {
    return bearer.slice("Bearer ".length).trim();
  }
  const header = req.headers["x-revalidate-secret"];
  if (typeof header === "string") return header.trim();
  const q = req.query.secret;
  if (typeof q === "string") return q.trim();
  return undefined;
};

const collectPaths = (req: NextApiRequest, body: RevalidateBody): string[] => {
  const out: string[] = [];
  const qPath = req.query.path;
  if (typeof qPath === "string" && qPath.trim().length > 0) {
    out.push(qPath.trim());
  }
  if (typeof body.path === "string" && body.path.trim().length > 0) {
    out.push(body.path.trim());
  }
  if (Array.isArray(body.paths)) {
    for (const p of body.paths) {
      if (typeof p === "string" && p.trim().length > 0) {
        out.push(p.trim());
      }
    }
  }
  return [...new Set(out)];
};

const handler = async (req: NextApiRequest, res: NextApiResponse<RevalidateOk | RevalidateErr>) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const expected = process.env.REVALIDATE_SECRET?.trim();
  if (!expected) {
    return res.status(503).json({
      ok: false,
      message: "REVALIDATE_SECRET is not configured",
    });
  }

  const secret = readSecret(req);
  if (secret !== expected) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const body: RevalidateBody =
    req.body !== null && typeof req.body === "object" ? (req.body as RevalidateBody) : {};

  const paths = collectPaths(req, body);
  if (paths.length === 0) {
    return res.status(400).json({
      ok: false,
      message: "Provide path: query ?path= or JSON body { path } / { paths }",
    });
  }

  for (const path of paths) {
    try {
      await res.revalidate(path);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      return res.status(500).json({
        ok: false,
        message: "Revalidate failed",
        path,
        detail,
      });
    }
  }

  return res.status(200).json({ ok: true, paths });
};

export default handler;
