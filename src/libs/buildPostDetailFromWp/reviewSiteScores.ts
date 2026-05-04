import type { PostDetailData } from "@/components/templates/PostDetail/PostDetail.types";
import type { TReviewSite } from "@/components/features/ReviewSiteScores/ReviewSiteScores";

import { HTTP_URL_RE } from "./constants";

/** 本番 ACF: `imdb` / `rotten_tomatoes` / `filmakrs`（Filmarks の表記）/ `eiga_com` の `{ score, site_url, score_audience? }` */
type WpExternalScoreBlock = {
  score?: unknown;
  site_url?: unknown;
  score_audience?: unknown;
};

/** ACF の外部スコア値を正の有限数へ（不正・0 以下は 0）。 */
const acfExternalScoreToPositiveNumber = (v: unknown): number => {
  if (v == null || v === "") return 0;
  const n = typeof v === "string" ? Number.parseFloat(v.trim()) : Number(v);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n;
};

/** `site_url` が http(s) のときだけ返す。 */
const acfExternalScoreUrl = (o: WpExternalScoreBlock): string | undefined => {
  const u = o.site_url;
  if (typeof u !== "string") return undefined;
  const t = u.trim();
  if (!t || !HTTP_URL_RE.test(t)) return undefined;
  return t;
};

/** unknown を外部スコアブロック形として扱える場合だけキャストする。 */
const asExternalScoreBlock = (raw: unknown): WpExternalScoreBlock | null => {
  if (!raw || typeof raw !== "object") return null;
  return raw as WpExternalScoreBlock;
};

/** IMDb / Rotten Tomatoes / Filmarks / 映画.com 等の ACF ブロックを ReviewSiteScores 用にまとめる。 */
export const buildReviewSiteScoresFromAcf = (
  acf: Record<string, unknown> | undefined,
  meta: { updatedAt?: string; publishedDate?: string },
): NonNullable<PostDetailData["reviewSiteScores"]> | undefined => {
  if (!acf) return undefined;
  const sites: TReviewSite[] = [];

  const imdb = asExternalScoreBlock(acf.imdb);
  if (imdb) {
    const score = acfExternalScoreToPositiveNumber(imdb.score);
    const url = acfExternalScoreUrl(imdb);
    if (score > 0) sites.push({ siteId: "imdb", score, ...(url ? { url } : {}) });
  }

  const rt = asExternalScoreBlock(acf.rotten_tomatoes);
  if (rt) {
    const url = acfExternalScoreUrl(rt);
    const critics = acfExternalScoreToPositiveNumber(rt.score);
    if (critics > 0) sites.push({ siteId: "rt-critics", score: critics, ...(url ? { url } : {}) });
    const audience = acfExternalScoreToPositiveNumber(rt.score_audience);
    if (audience > 0) sites.push({ siteId: "rt-audience", score: audience, ...(url ? { url } : {}) });
  }

  const filmarksBlock = asExternalScoreBlock(acf.filmarks) ?? asExternalScoreBlock(acf.filmakrs);
  if (filmarksBlock) {
    const score = acfExternalScoreToPositiveNumber(filmarksBlock.score);
    const url = acfExternalScoreUrl(filmarksBlock);
    if (score > 0) sites.push({ siteId: "filmarks", score, ...(url ? { url } : {}) });
  }

  const eiga = asExternalScoreBlock(acf.eiga_com);
  if (eiga) {
    const score = acfExternalScoreToPositiveNumber(eiga.score);
    const url = acfExternalScoreUrl(eiga);
    if (score > 0) sites.push({ siteId: "eiga-com", score, ...(url ? { url } : {}) });
  }

  if (sites.length === 0) return undefined;
  return {
    sites,
    ...(meta.updatedAt ? { updatedAt: meta.updatedAt } : {}),
    ...(meta.publishedDate ? { publishedDate: meta.publishedDate } : {}),
  };
};
