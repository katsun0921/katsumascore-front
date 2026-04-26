import type { PostDetailData } from "@/components/templates/PostDetail/PostDetail.types";
import type { TActor, TTitleMetaProps } from "@/components/features/Post/PostTitleMeta";
import type { TRelationPostItem } from "@/components/features/RelationPost";
import type { TStreamingVodEntry } from "@/components/features/StreamingVod";
import type { TRentalService } from "@/components/features/AdRental";
import type { TPostsGroupItem } from "@/components/features/Post/PostsGroup";
import type { ParsedWPPost } from "@/lib/api/wordpress.schema";
import { parseWPPostUnknown, stripHtml, mapWPPostToPost } from "@/lib/api/wordpress.transform";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://katsumascore.blog";

const collectNumericIds = (v: unknown, out: Set<number>) => {
  if (v == null) return;
  if (typeof v === "number" && Number.isFinite(v) && v > 0) {
    out.add(Math.floor(v));
    return;
  }
  if (Array.isArray(v)) {
    for (const item of v) {
      collectNumericIds(item, out);
    }
    return;
  }
  if (typeof v === "object" && v !== null && "id" in v) {
    const id = (v as { id: unknown }).id;
    if (typeof id === "number" && Number.isFinite(id)) out.add(id);
  }
};

const RELATION_ACF_KEYS = [
  "related_posts",
  "related_movies",
  "relation_posts",
  "series_posts",
  "acf_relation",
  "rm_related",
  "relation_article",
];

/** WP の ACF リレーションから投稿 ID を抽出（返却形の差異を吸収） */
export const extractRelationPostIds = (acf: Record<string, unknown> | undefined): number[] => {
  if (!acf) return [];
  const ids = new Set<number>();
  for (const key of RELATION_ACF_KEYS) {
    if (key in acf) collectNumericIds(acf[key], ids);
  }
  return [...ids];
};

const parseOfficialSns = (raw: unknown): TTitleMetaProps["officialSns"] => {
  if (raw == null) return undefined;
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return undefined;
    try {
      const j = JSON.parse(t) as Record<string, unknown>;
      const out: Record<string, { link?: string }> = {};
      for (const [k, val] of Object.entries(j)) {
        if (typeof val === "string" && val.startsWith("http")) out[k] = { link: val };
        else if (val && typeof val === "object" && "url" in val && typeof (val as { url: unknown }).url === "string") {
          out[k] = { link: (val as { url: string }).url };
        }
      }
      return Object.keys(out).length > 0 ? out : undefined;
    } catch {
      if (t.startsWith("http")) return { web: { link: t } };
      return undefined;
    }
  }
  if (typeof raw === "object") {
    const out: Record<string, { link?: string }> = {};
    for (const [k, val] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof val === "string" && val.startsWith("http")) out[k] = { link: val };
      else if (val && typeof val === "object") {
        const link = (val as { link?: unknown; url?: unknown }).link ?? (val as { url?: unknown }).url;
        if (typeof link === "string") out[k] = { link };
      }
    }
    return Object.keys(out).length > 0 ? out : undefined;
  }
  return undefined;
};

const splitGoodPoints = (raw: string | undefined): string[] | undefined => {
  if (!raw?.trim()) return undefined;
  const parts = raw
    .split(/\r?\n|\|/)
    .map((s) => stripHtml(s).trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : undefined;
};

const mapActors = (wp: ParsedWPPost): TActor[] | undefined => {
  const rows = wp.acf?.actors_filed;
  if (!Array.isArray(rows) || rows.length === 0) return undefined;
  return rows.map((row) => {
    const ext = row as { name: string; role?: unknown };
    const roleStr = typeof ext.role === "string" ? ext.role : undefined;
    return {
      character: roleStr,
      actorName: ext.name,
    };
  });
};

const buildStreamingVods = (wp: ParsedWPPost): TStreamingVodEntry[] | undefined => {
  const acf = wp.acf;
  if (!acf) return undefined;
  const out: TStreamingVodEntry[] = [];
  if (acf.streaming_vod_netflix) {
    out.push({ service: "netflix", url: "https://www.netflix.com" });
  }
  if (acf.streaming_vod_amazon) {
    out.push({ service: "amazon", url: "https://www.amazon.co.jp/gp/video/storefront" });
  }
  if (acf.streaming_vod_unext) {
    out.push({ service: "unext", url: "https://video.unext.jp" });
  }
  return out.length > 0 ? out : undefined;
};

const buildRentalServices = (wp: ParsedWPPost): TRentalService[] | undefined => {
  const rows = wp.acf?.rental_services;
  if (Array.isArray(rows) && rows.length > 0) {
    return rows.map((r) => ({ service: r.service, url: r.url }));
  }
  return undefined;
};

const extractPostsGroupIds = (acf: Record<string, unknown> | undefined): { heading: string; ids: number[] }[] => {
  if (!acf) return [];
  const raw = acf.posts_groups ?? acf.post_groups ?? acf.related_groups;
  if (!Array.isArray(raw)) return [];
  const groups: { heading: string; ids: number[] }[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const heading = typeof o.heading === "string" ? o.heading : typeof o.title === "string" ? o.title : "";
    const ids = new Set<number>();
    collectNumericIds(o.posts ?? o.post_ids ?? o.ids, ids);
    if (heading && ids.size > 0) groups.push({ heading, ids: [...ids] });
  }
  return groups;
};

export type BuildPostDetailFromWpInput = {
  wp: unknown;
  locale: string;
  relationPosts?: TRelationPostItem[];
  postsGroups?: TPostsGroupItem[];
};

/** GSP から渡す WP 生データを PostDetail 向けに正規化・マージする */
export const buildPostDetailFromWp = ({
  wp,
  locale,
  relationPosts,
  postsGroups,
}: BuildPostDetailFromWpInput): PostDetailData | null => {
  const parsed = parseWPPostUnknown(wp);
  if (!parsed) return null;
  const base = mapWPPostToPost(wp);
  if (!base) return null;

  const acf = parsed.acf as Record<string, unknown> | undefined;
  const titleEnRaw = parsed.acf?.title_en?.trim();
  const titleEn = titleEnRaw ? stripHtml(titleEnRaw) : undefined;

  const summaryJp = parsed.acf?.acf_summary_group?.summary_jp;
  const summaryEn = parsed.acf?.acf_summary_group?.summary_en;
  const summaryText =
    locale === "en"
      ? (summaryEn?.trim() ? stripHtml(summaryEn) : summaryJp?.trim() ? stripHtml(summaryJp) : "")
      : summaryJp?.trim()
        ? stripHtml(summaryJp)
        : summaryEn?.trim()
          ? stripHtml(summaryEn)
          : "";

  const summary =
    summaryText.length > 0
      ? {
          text: summaryText,
          refUrl: parsed.acf?.official_url?.trim() || undefined,
          refLabel: locale === "en" ? "Official site" : "公式サイト",
        }
      : undefined;

  const releaseDate = parsed.acf?.release_date?.trim();
  const titleMeta: Omit<TTitleMetaProps, "locale"> | undefined =
    parsed.acf?.official_url ||
    releaseDate ||
    parseOfficialSns(parsed.acf?.official_sns) ||
    acf?.copyright
      ? {
          officialUrl: parsed.acf?.official_url?.trim(),
          copyright: typeof acf?.copyright === "string" ? acf.copyright : undefined,
          releaseDate: releaseDate && releaseDate.length === 8 ? releaseDate : undefined,
          officialSns: parseOfficialSns(parsed.acf?.official_sns),
        }
      : undefined;

  const trailerYoutubeId =
    parsed.acf?.trailer_youtube_id?.trim() ||
    parsed.acf?.trailer_youtube?.trim() ||
    (typeof acf?.youtube_id === "string" ? acf.youtube_id.trim() : undefined);

  return {
    ...base,
    titleEn: titleEn || undefined,
    updatedAt: parsed.modified?.slice(0, 10),
    rating: parsed.acf?.rating?.trim() || undefined,
    trailerYoutubeId: trailerYoutubeId || undefined,
    authorComment: parsed.acf?.author_comment?.trim() || undefined,
    goodPoints: splitGoodPoints(parsed.acf?.good_point_filed),
    summary,
    TitleMeta: titleMeta,
    credits: undefined,
    actors: mapActors(parsed),
    isCinemaShowing: Boolean(parsed.acf?.is_cinema_showing),
    streamingVods: buildStreamingVods(parsed),
    rentalServices: buildRentalServices(parsed),
    relationPosts: relationPosts && relationPosts.length > 0 ? relationPosts : undefined,
    postsGroups: postsGroups && postsGroups.length > 0 ? postsGroups : undefined,
    shareUrl: `${SITE_URL.replace(/\/$/, "")}${base.slug}`,
  };
};

export const extractPostsGroupSpecsFromWp = (wp: unknown): { heading: string; ids: number[] }[] => {
  const p = parseWPPostUnknown(wp);
  if (!p) return [];
  return extractPostsGroupIds(p.acf as Record<string, unknown> | undefined);
};
