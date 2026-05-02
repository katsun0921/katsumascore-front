import type { PostDetailData } from "@/components/templates/PostDetail/PostDetail.types";
import type { TActor, TTitleMetaProps } from "@/components/features/Post/PostTitleMeta";
import type { TRelationPostItem } from "@/components/features/RelationPost";
import type { TStreamingVodEntry } from "@/components/features/StreamingVod";
import type { TRentalService } from "@/components/features/AdRental";
import type { TPostsGroupItem } from "@/components/features/Post/PostsGroup";
import type { ParsedWPPost } from "@/libs/api/wordpress";
import { parseWPPostUnknown, stripHtml, mapWPPostToPost } from "@/libs/api/wordpress";

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
  const out: TActor[] = [];
  for (const row of rows) {
    const ext = row as {
      name?: unknown;
      role?: unknown;
      character?: unknown;
      description?: unknown;
    };
    const nameStr = typeof ext.name === "string" && ext.name.trim() ? ext.name.trim() : undefined;
    const charStr =
      typeof ext.character === "string" && ext.character.trim() ? ext.character.trim() : undefined;
    const roleStr = typeof ext.role === "string" && ext.role.trim() ? ext.role.trim() : undefined;
    const descStr =
      typeof ext.description === "string" && ext.description.trim() ? ext.description.trim() : undefined;
    const actorName = nameStr ?? charStr ?? "";
    if (!actorName && !charStr && !descStr) continue;
    out.push({
      character: roleStr ?? charStr,
      actorName: actorName || charStr || "—",
      ...(descStr ? { description: descStr } : {}),
    });
  }
  return out.length > 0 ? out : undefined;
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

/** WP が URL / ID 混在で返す trailer フィールドから YouTube の video id を取得 */
const extractYoutubeVideoId = (raw: string | undefined): string | undefined => {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (/^[\w-]{11}$/.test(t) && !/^https?:\/\//i.test(t)) return t;
  const q = t.match(/[?&]v=([\w-]{11})/);
  if (q?.[1]) return q[1];
  const shortm = t.match(/youtu\.be\/([\w-]{11})/);
  if (shortm?.[1]) return shortm[1];
  const emb = t.match(/youtube\.com\/embed\/([\w-]{11})/);
  if (emb?.[1]) return emb[1];
  const sh = t.match(/youtube\.com\/shorts\/([\w-]{11})/);
  if (sh?.[1]) return sh[1];
  return undefined;
};

const scalarToTrimmedString = (v: unknown): string => {
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v).trim();
  return "";
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

  const sg = parsed.acf?.acf_summary_group as Record<string, unknown> | undefined;

  const snippetFrom = (raw: unknown): string => {
    if (typeof raw !== "string") return "";
    const t = raw.trim();
    if (!t) return "";
    return stripHtml(t);
  };

  /** グループ内・ルート ACF の両方からあらすじ本文を拾う（テーマ acf-summary.php は acf_summary_text 中心） */
  const summaryJpFromFields = (): string => {
    const fromGroup =
      snippetFrom(sg?.summary_jp) ||
      snippetFrom(sg?.acf_summary_text) ||
      snippetFrom(sg?.acf_summary_text_jp);
    if (fromGroup) return fromGroup;
    if (!acf) return "";
    return snippetFrom(acf.acf_summary_text) || snippetFrom(acf.summary_jp);
  };

  const summaryEnFromFields = (): string => {
    const fromGroup = snippetFrom(sg?.summary_en) || snippetFrom(sg?.acf_summary_text_en);
    if (fromGroup) return fromGroup;
    if (!acf) return "";
    return snippetFrom(acf.summary_en);
  };

  const jpText = summaryJpFromFields();
  const enText = summaryEnFromFields();
  let summaryText = "";
  if (locale === "en") {
    summaryText = enText || jpText;
  } else {
    summaryText = jpText || enText;
  }

  if (!summaryText.trim() && base.excerpt.trim()) {
    summaryText = base.excerpt;
  }

  const officialUrl = parsed.acf?.official_url?.trim();
  const groupRefUrl = typeof sg?.acf_ref_url === "string" ? sg.acf_ref_url.trim() : "";
  const groupRefLabelRaw = typeof sg?.acf_summary_ref === "string" ? sg.acf_summary_ref.trim() : "";
  const citeUrl = officialUrl || groupRefUrl;
  let citeLabel: string | undefined;
  if (citeUrl) {
    if (groupRefLabelRaw) citeLabel = stripHtml(groupRefLabelRaw);
    else citeLabel = locale === "en" ? "Official site" : "公式サイト";
  }

  const summary =
    summaryText.length > 0
      ? {
          text: summaryText,
          ...(citeUrl ? { refUrl: citeUrl, ...(citeLabel ? { refLabel: citeLabel } : {}) } : {}),
        }
      : undefined;

  const releaseDate = parsed.acf?.release_date?.trim();
  const titleMeta: Omit<TTitleMetaProps, "locale"> | undefined =
    parsed.acf?.official_url ||
    releaseDate ||
    parseOfficialSns(parsed.acf?.official_sns) ||
    acf?.copyright
      ? {
          ...(parsed.acf?.official_url?.trim() ? { officialUrl: parsed.acf.official_url.trim() } : {}),
          ...(typeof acf?.copyright === "string" ? { copyright: acf.copyright } : {}),
          ...(releaseDate && releaseDate.length === 8 ? { releaseDate } : {}),
          ...(parseOfficialSns(parsed.acf?.official_sns) ? { officialSns: parseOfficialSns(parsed.acf?.official_sns) } : {}),
        }
      : undefined;

  const metaRecord =
    parsed.meta && typeof parsed.meta === "object" && !Array.isArray(parsed.meta)
      ? (parsed.meta as Record<string, unknown>)
      : undefined;

  /** タグライン: REST の post meta は `tagline`（ACF 側も同一キーの場合あり） */
  const taglineRaw =
    scalarToTrimmedString(metaRecord?.tagline) || scalarToTrimmedString(acf?.tagline);
  const authorComment = taglineRaw.length > 0 ? stripHtml(taglineRaw) : undefined;

  const videoCodeFromMeta =
    typeof metaRecord?.video_code === "string" && metaRecord.video_code.trim()
      ? metaRecord.video_code.trim()
      : undefined;
  let videoCodeFromAcf: string | undefined;
  if (typeof acf?.video_code === "string" && acf.video_code.trim()) {
    videoCodeFromAcf = acf.video_code.trim();
  } else if (typeof acf?.trailer_embed === "string" && acf.trailer_embed.trim()) {
    videoCodeFromAcf = acf.trailer_embed.trim();
  }
  const trailerEmbedCode = videoCodeFromMeta ?? videoCodeFromAcf;

  const idCandidates = [
    parsed.acf?.trailer_youtube_id,
    parsed.acf?.trailer_youtube,
    typeof acf?.youtube_id === "string" ? acf.youtube_id : undefined,
  ];
  let trailerYoutubeId: string | undefined;
  for (const c of idCandidates) {
    if (typeof c !== "string" || !c.trim()) continue;
    const id = extractYoutubeVideoId(c.trim());
    if (id) {
      trailerYoutubeId = id;
      break;
    }
  }

  const updatedAt = parsed.modified?.slice(0, 10);
  const goodPoints = splitGoodPoints(parsed.acf?.good_point_filed);
  const actors = mapActors(parsed);
  const streamingVods = buildStreamingVods(parsed);
  const rentalServices = buildRentalServices(parsed);

  const trailerVideo: { trailerEmbedCode?: string; trailerYoutubeId?: string } = {};
  if (trailerEmbedCode) {
    trailerVideo.trailerEmbedCode = trailerEmbedCode;
  } else if (trailerYoutubeId) {
    trailerVideo.trailerYoutubeId = trailerYoutubeId;
  }

  return {
    ...base,
    ...(titleEn ? { titleEn } : {}),
    ...(updatedAt ? { updatedAt } : {}),
    ...trailerVideo,
    ...(authorComment ? { authorComment } : {}),
    ...(goodPoints ? { goodPoints } : {}),
    ...(summary ? { summary } : {}),
    ...(titleMeta ? { TitleMeta: titleMeta } : {}),
    ...(actors ? { actors } : {}),
    isCinemaShowing: Boolean(parsed.acf?.is_cinema_showing),
    ...(streamingVods ? { streamingVods } : {}),
    ...(rentalServices ? { rentalServices } : {}),
    ...(relationPosts && relationPosts.length > 0 ? { relationPosts } : {}),
    ...(postsGroups && postsGroups.length > 0 ? { postsGroups } : {}),
    shareUrl: `${SITE_URL.replace(/\/$/, "")}${base.slug}`,
  };
};

export const extractPostsGroupSpecsFromWp = (wp: unknown): { heading: string; ids: number[] }[] => {
  const p = parseWPPostUnknown(wp);
  if (!p) return [];
  return extractPostsGroupIds(p.acf as Record<string, unknown> | undefined);
};
