import type { Post } from "@/types/post";
import type { PostDetailData } from "@/components/templates/PostDetail/PostDetail.types";
import type { ParsedWPPost } from "@/libs/api/wordpress";
import { parseWPPostUnknown, stripHtml } from "@/libs/api/wordpress";

import { acfTruthy } from "./acfScalars";
import { HTTP_URL_RE } from "./constants";

const pickVodTermId = (raw: unknown): number | undefined => {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.floor(raw);
  }
  if (typeof raw === "string" && /^\d+$/.test(raw.trim())) {
    return Number.parseInt(raw.trim(), 10);
  }
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    const idRaw = o.term_id ?? o.id;
    if (typeof idRaw === "number" && Number.isFinite(idRaw) && idRaw > 0) {
      return Math.floor(idRaw);
    }
    if (typeof idRaw === "string" && /^\d+$/.test(idRaw.trim())) {
      return Number.parseInt(idRaw.trim(), 10);
    }
  }
  return undefined;
};

const resolveVodTermFromEmbedded = (
  wp: ParsedWPPost,
  termId: number,
): { name: string; slug: string } | undefined => {
  const groups = wp._embedded?.["wp:term"];
  if (!Array.isArray(groups)) return undefined;
  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const term of group) {
      const t = term as Record<string, unknown>;
      const id = typeof t.id === "number" ? t.id : undefined;
      const taxRaw = typeof t.taxonomy === "string" ? t.taxonomy.trim() : "";
      const tax = taxRaw.replace(/^wp_/i, "").toLowerCase();
      if (tax !== "vod") continue;
      if (id !== termId) continue;
      const name = typeof t.name === "string" ? t.name.trim() : "";
      const slug = typeof t.slug === "string" ? t.slug.trim() : "";
      if (name) return { name, slug };
    }
  }
  return undefined;
};

const getWatchedVodRecord = (acf: Record<string, unknown>): Record<string, unknown> | undefined => {
  const sv = acf.streaming_vod;
  if (!sv || typeof sv !== "object" || Array.isArray(sv)) return undefined;
  const wv = (sv as Record<string, unknown>).watched_vod;
  if (!wv || typeof wv !== "object" || Array.isArray(wv)) return undefined;
  return wv as Record<string, unknown>;
};

const resolveVodServiceFromAcf = (
  wp: ParsedWPPost,
  acf: Record<string, unknown>,
): { name: string; slug: string } | undefined => {
  const wv = getWatchedVodRecord(acf);
  if (!wv) return undefined;
  const raw = wv.watched_vod_name;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const slug = typeof o.slug === "string" ? o.slug.trim() : "";
    if (name) return { name, slug };
  }
  const termId = pickVodTermId(raw);
  if (termId === undefined) return undefined;
  return resolveVodTermFromEmbedded(wp, termId);
};

export const buildVodIntroductionPayload = (
  parsed: ParsedWPPost,
  base: Post & { content: string },
  acf: Record<string, unknown> | undefined,
  titleEn: string | undefined,
  vodRelatedPosts: Post[] | undefined,
): PostDetailData["vodIntroduction"] | undefined => {
  if (!acf) return undefined;
  if (!acfTruthy(acf.is_vod_streaming)) return undefined;
  const cinemaFiled = acf.cinema_info_filed;
  if (
    cinemaFiled &&
    typeof cinemaFiled === "object" &&
    !Array.isArray(cinemaFiled) &&
    acfTruthy((cinemaFiled as Record<string, unknown>).is_cinema_watched)
  ) return undefined;

  const vodMeta = resolveVodServiceFromAcf(parsed, acf);
  if (!vodMeta?.name) return undefined;

  const wv = getWatchedVodRecord(acf)!;
  const vodUrlRaw =
    typeof wv.watched_vod_url === "string" ? wv.watched_vod_url.trim() : "";
  const vodUrl = HTTP_URL_RE.test(vodUrlRaw) ? vodUrlRaw : undefined;
  const isAffiliate = acfTruthy(wv.is_affiliate_code);
  const affiliateCode =
    typeof wv.affiliate_code === "string" ? wv.affiliate_code.trim() : "";

  if (!vodUrl && !(isAffiliate && affiliateCode.length > 0)) return undefined;

  const titleJp =
    typeof acf.title_jp === "string" && acf.title_jp.trim()
      ? stripHtml(acf.title_jp.trim())
      : base.title;

  const publishedAt = parsed.date.slice(0, 10);
  const updatedAt = parsed.modified?.slice(0, 10);

  const out: NonNullable<PostDetailData["vodIntroduction"]> = {
    titleJp,
    ...(titleEn ? { titleEn } : {}),
    writtenFrom: {
      type: "vod",
      vodName: vodMeta.name,
      vodUrl: vodUrl ?? "",
    },
    publishedAt,
    ...(updatedAt ? { updatedAt } : {}),
    ...(vodRelatedPosts && vodRelatedPosts.length > 0 ? { relatedPosts: vodRelatedPosts } : {}),
    ...(isAffiliate && affiliateCode.length > 0 ? { affiliateHtml: affiliateCode } : {}),
  };
  return out;
};

/** VOD 紹介の関連記事取得用。条件は `buildVodIntroductionPayload` と一致させる */
export const extractVodIntroductionRelatedPostsTermId = (wp: unknown): number | undefined => {
  const parsed = parseWPPostUnknown(wp);
  if (!parsed) return undefined;
  const acf = parsed.acf as Record<string, unknown> | undefined;
  if (!acf) return undefined;
  if (!acfTruthy(acf.is_vod_streaming)) return undefined;
  const cinemaFiled = acf.cinema_info_filed;
  if (
    cinemaFiled &&
    typeof cinemaFiled === "object" &&
    !Array.isArray(cinemaFiled) &&
    acfTruthy((cinemaFiled as Record<string, unknown>).is_cinema_watched)
  ) return undefined;
  const wv = getWatchedVodRecord(acf);
  return wv ? pickVodTermId(wv.watched_vod_name) : undefined;
};
