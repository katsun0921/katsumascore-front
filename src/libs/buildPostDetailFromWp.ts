import type { PostDetailData } from "@/components/templates/PostDetail/PostDetail.types";
import type { TActor, TTitleMetaProps } from "@/components/features/Post/PostTitleMeta";
import type { TRelationPostItem } from "@/components/features/RelationPost";
import type { TStreamingVodEntry } from "@/components/features/StreamingVod";
import type { TRentalService } from "@/components/features/AdRental";
import type { TPostsGroupItem } from "@/components/features/Post/PostsGroup";
import type { ParsedWPPost } from "@/libs/api/wordpress";
import {
  parseWPPostUnknown,
  stripHtml,
  mapWPPostToPost,
  extractGenreLinksFromParsedWp,
  extractPostTagLinksFromParsedWp,
} from "@/libs/api/wordpress";

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

const HTTP_URL_RE = /^https?:\/\//i;

const extractSnsLink = (val: unknown): string | undefined => {
  if (typeof val === "string") {
    const t = val.trim();
    return HTTP_URL_RE.test(t) ? t : undefined;
  }
  if (!val || typeof val !== "object") return undefined;
  const o = val as { link?: unknown; url?: unknown; href?: unknown };
  const candidates = [o.link, o.url, o.href];
  for (const c of candidates) {
    if (typeof c === "string" && HTTP_URL_RE.test(c.trim())) return c.trim();
  }
  return undefined;
};

type OfficialSnsEntry = NonNullable<TTitleMetaProps["officialSns"]>[string];

/** CMS 埋め込みスニペットから &lt;script&gt; を除く（widgets / embed.js はフロントで読み込む） */
const stripSnsEmbedScripts = (html: string): string =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").trim();

const extractXEmbedHtmlFromString = (raw: string): string | undefined => {
  const t = raw.trim();
  if (!/twitter-tweet/i.test(t)) return undefined;
  return stripSnsEmbedScripts(t);
};

const extractXEmbedHtmlFromObject = (val: unknown): string | undefined => {
  if (!val || typeof val !== "object") return undefined;
  const o = val as Record<string, unknown>;
  const keys = ["embed", "embed_code", "code", "html", "oembed", "iframe_code", "value", "tweet_embed"];
  for (const key of keys) {
    const h = o[key];
    if (typeof h === "string" && /twitter-tweet/i.test(h)) return stripSnsEmbedScripts(h.trim());
  }
  return undefined;
};

const extractInstagramEmbedHtmlFromString = (raw: string): string | undefined => {
  const t = raw.trim();
  if (!/instagram-media/i.test(t) && !/data-instgrm-permalink/i.test(t)) return undefined;
  return stripSnsEmbedScripts(t);
};

const extractInstagramEmbedHtmlFromObject = (val: unknown): string | undefined => {
  if (!val || typeof val !== "object") return undefined;
  const o = val as Record<string, unknown>;
  const keys = ["embed", "embed_code", "code", "html", "oembed", "iframe_code", "value"];
  for (const key of keys) {
    const h = o[key];
    if (typeof h === "string" && (/instagram-media/i.test(h) || /data-instgrm-permalink/i.test(h))) {
      return stripSnsEmbedScripts(h.trim());
    }
  }
  return undefined;
};

/** 埋め込み HTML から投稿・リールのパーマリンク（link 未入力時の補完用） */
const extractPermalinkFromInstagramEmbedHtml = (html: string): string | undefined => {
  const m = html.match(/data-instgrm-permalink="([^"]+)"/i);
  if (m?.[1]) return m[1].replace(/&amp;/g, "&").trim();
  const m2 = html.match(
    /href="(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/[^"/]+)/i,
  );
  if (m2?.[1]) return m2[1].replace(/&amp;/g, "&").trim();
  return undefined;
};

const extractTikTokEmbedHtmlFromString = (raw: string): string | undefined => {
  const t = raw.trim();
  if (!/tiktok-embed/i.test(t) && !/tiktok\.com\/embed\//i.test(t)) return undefined;
  return stripSnsEmbedScripts(t);
};

const extractTikTokEmbedHtmlFromObject = (val: unknown): string | undefined => {
  if (!val || typeof val !== "object") return undefined;
  const o = val as Record<string, unknown>;
  const keys = ["embed", "embed_code", "code", "html", "oembed", "iframe_code", "value"];
  for (const key of keys) {
    const h = o[key];
    if (typeof h === "string" && (/tiktok-embed/i.test(h) || /tiktok\.com\/embed\//i.test(h))) {
      return stripSnsEmbedScripts(h.trim());
    }
  }
  return undefined;
};

const isTikTokVideoUrl = (url: string): boolean => {
  try {
    const u = new URL(url.trim());
    if (!u.hostname.includes("tiktok.com")) return false;
    return (
      /\/video\/\d+/i.test(u.pathname) ||
      /\/embed\/v2\/\d+/i.test(u.pathname) ||
      /\/embed\/\d+/i.test(u.pathname)
    );
  } catch {
    return false;
  }
};

/** blockquote 内の status リンク（フォールバック・正規化用） */
const extractStatusUrlFromTweetEmbed = (html: string): string | undefined => {
  const m = html.match(
    /href="(https?:\/\/(?:twitter\.com|x\.com)\/[^"\\/]+\/status\/\d+[^"]*)"/i,
  );
  if (!m?.[1]) return undefined;
  return m[1].replace(/&amp;/g, "&");
};

const mergeOfficialSnsEntry = (base: OfficialSnsEntry, add: OfficialSnsEntry): OfficialSnsEntry => {
  const merged: OfficialSnsEntry = {};
  const link = base.link ?? add.link;
  const embedHtml = base.embedHtml ?? add.embedHtml;
  if (link) merged.link = link;
  if (embedHtml) merged.embedHtml = embedHtml;
  return merged;
};

/** WP・ACF の表記ゆれ（twitter / Youtube 等）を TitleMeta が参照するキーへ寄せる */
const canonicalOfficialSnsKeys = (out: Record<string, OfficialSnsEntry>): Record<string, OfficialSnsEntry> => {
  const merged: Record<string, OfficialSnsEntry> = {};
  for (const [k, v] of Object.entries(out)) {
    const link = v?.link?.trim();
    const embedHtml = v?.embedHtml?.trim();
    const linkOk = Boolean(link && HTTP_URL_RE.test(link));
    if (!embedHtml && !linkOk) continue;
    const lower = k.toLowerCase().replace(/\s+/g, "_");
    let canon = k;
    if (lower === "twitter" || lower === "x") canon = "x";
    else if (lower === "youtube" || lower === "youtube_channel") canon = "youtube_channel";
    else if (lower === "instagram") canon = "instagram";
    else if (lower === "tiktok" || lower === "tik_tok") canon = "tiktok";
    else if (embedHtml && /twitter-tweet/i.test(embedHtml)) canon = "x";
    else if (embedHtml && (/tiktok-embed/i.test(embedHtml) || /tiktok\.com\/embed\//i.test(embedHtml))) {
      canon = "tiktok";
    }
    else if (embedHtml && (/instagram-media/i.test(embedHtml) || /data-instgrm-permalink/i.test(embedHtml))) {
      canon = "instagram";
    }
    else if (linkOk && link && isTikTokVideoUrl(link)) canon = "tiktok";
    const next: OfficialSnsEntry = { ...(linkOk ? { link } : {}), ...(embedHtml ? { embedHtml } : {}) };
    merged[canon] = merged[canon] ? mergeOfficialSnsEntry(merged[canon], next) : next;
  }
  return merged;
};

const parseOfficialSnsObjectShape = (raw: Record<string, unknown>): Record<string, OfficialSnsEntry> => {
  const out: Record<string, OfficialSnsEntry> = {};
  for (const [k, val] of Object.entries(raw)) {
    if (typeof val === "string") {
      const t = val.trim();
      const xEmbed = extractXEmbedHtmlFromString(t);
      if (xEmbed) {
        const statusUrl = extractStatusUrlFromTweetEmbed(xEmbed);
        out[k] = statusUrl ? { embedHtml: xEmbed, link: statusUrl } : { embedHtml: xEmbed };
        continue;
      }
      const tiktokEmbed = extractTikTokEmbedHtmlFromString(t);
      if (tiktokEmbed) {
        out[k] = { embedHtml: tiktokEmbed };
        continue;
      }
      const igEmbed = extractInstagramEmbedHtmlFromString(t);
      if (igEmbed) {
        const perm = extractPermalinkFromInstagramEmbedHtml(igEmbed);
        out[k] = perm ? { embedHtml: igEmbed, link: perm } : { embedHtml: igEmbed };
        continue;
      }
      if (HTTP_URL_RE.test(t)) {
        out[k] = { link: t };
      }
      continue;
    }
    const embedHtmlX = extractXEmbedHtmlFromObject(val);
    const embedHtmlTikTok = extractTikTokEmbedHtmlFromObject(val);
    const embedHtmlIg = extractInstagramEmbedHtmlFromObject(val);
    const embedHtml = embedHtmlX ?? embedHtmlTikTok ?? embedHtmlIg;
    const link = extractSnsLink(val);
    const entry: OfficialSnsEntry = {};
    if (link) entry.link = link;
    if (embedHtml) {
      entry.embedHtml = embedHtml;
      const statusUrl = extractStatusUrlFromTweetEmbed(embedHtml);
      if (statusUrl && !entry.link) entry.link = statusUrl;
      if (!entry.link) {
        const igPerm = extractPermalinkFromInstagramEmbedHtml(embedHtml);
        if (igPerm) entry.link = igPerm;
      }
    }
    if (entry.link || entry.embedHtml) out[k] = entry;
  }
  return canonicalOfficialSnsKeys(out);
};

const parseOfficialSnsArrayShape = (raw: unknown[]): Record<string, OfficialSnsEntry> => {
  const out: Record<string, OfficialSnsEntry> = {};
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const platformRaw = row.platform ?? row.name ?? row.field ?? row.key;
    const platform = typeof platformRaw === "string" ? platformRaw.trim() : "";
    const link = extractSnsLink(row) ?? extractSnsLink({ link: row.link, url: row.url, href: row.href });
    const rowEmbedX = extractXEmbedHtmlFromObject(row);
    const rowEmbedTt = extractTikTokEmbedHtmlFromObject(row);
    const rowEmbedIg = extractInstagramEmbedHtmlFromObject(row);
    const embedHtml = rowEmbedX ?? rowEmbedTt ?? rowEmbedIg;
    if (!platform || (!link && !embedHtml)) continue;
    const entry: OfficialSnsEntry = {};
    if (link) entry.link = link;
    if (embedHtml) {
      entry.embedHtml = embedHtml;
      const statusUrl = extractStatusUrlFromTweetEmbed(embedHtml);
      if (statusUrl && !entry.link) entry.link = statusUrl;
      if (!entry.link) {
        const igPerm = extractPermalinkFromInstagramEmbedHtml(embedHtml);
        if (igPerm) entry.link = igPerm;
      }
    }
    out[platform] = entry;
  }
  return canonicalOfficialSnsKeys(out);
};

const parseOfficialSns = (raw: unknown): TTitleMetaProps["officialSns"] => {
  if (raw == null) return undefined;
  if (Array.isArray(raw)) {
    const out = parseOfficialSnsArrayShape(raw);
    return Object.keys(out).length > 0 ? out : undefined;
  }
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return undefined;
    try {
      const j = JSON.parse(t) as Record<string, unknown>;
      const out = parseOfficialSnsObjectShape(j);
      return Object.keys(out).length > 0 ? out : undefined;
    } catch {
      if (HTTP_URL_RE.test(t)) return { web: { link: t } };
      const xEmb = extractXEmbedHtmlFromString(t);
      if (xEmb) {
        const statusUrl = extractStatusUrlFromTweetEmbed(xEmb);
        return { x: statusUrl ? { embedHtml: xEmb, link: statusUrl } : { embedHtml: xEmb } };
      }
      const ttEmb = extractTikTokEmbedHtmlFromString(t);
      if (ttEmb) return { tiktok: { embedHtml: ttEmb } };
      const igEmb = extractInstagramEmbedHtmlFromString(t);
      if (igEmb) {
        const perm = extractPermalinkFromInstagramEmbedHtml(igEmb);
        return { instagram: perm ? { embedHtml: igEmb, link: perm } : { embedHtml: igEmb } };
      }
      return undefined;
    }
  }
  if (typeof raw === "object") {
    const out = parseOfficialSnsObjectShape(raw as Record<string, unknown>);
    return Object.keys(out).length > 0 ? out : undefined;
  }
  return undefined;
};

const splitGoodPoints = (raw: unknown): string[] | undefined => {
  // ACF repeater形式: [{good_point_text: string}, ...]
  if (Array.isArray(raw)) {
    const parts = raw
      .map((r) => {
        if (typeof r === "object" && r !== null && "good_point_text" in r) {
          return stripHtml(String((r as Record<string, unknown>).good_point_text)).trim();
        }
        return typeof r === "string" ? stripHtml(r).trim() : "";
      })
      .filter(Boolean);
    return parts.length > 0 ? parts : undefined;
  }
  // 旧形式: 改行 or | 区切りの文字列
  if (typeof raw !== "string" || !raw.trim()) return undefined;
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
    const displayCharacter = roleStr ?? charStr;
    if (!displayCharacter && !nameStr && !descStr) continue;
    out.push({
      ...(displayCharacter ? { character: displayCharacter } : {}),
      ...(nameStr ? { actorName: nameStr } : {}),
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

  const releaseGroup = acf?.release as Record<string, unknown> | undefined;
  const releaseDate = (
    (typeof releaseGroup?.release_date === "string" ? releaseGroup.release_date : "") ||
    parsed.acf?.release_date?.trim() ||
    ""
  ).trim() || undefined;
  const officialSnsParsed = parseOfficialSns(parsed.acf?.official_sns);
  const titleMeta: Omit<TTitleMetaProps, "locale"> | undefined =
    parsed.acf?.official_url ||
    releaseDate ||
    officialSnsParsed ||
    acf?.copyright
      ? {
          ...(parsed.acf?.official_url?.trim() ? { officialUrl: parsed.acf.official_url.trim() } : {}),
          ...(typeof acf?.copyright === "string" ? { copyright: acf.copyright } : {}),
          ...(releaseDate && releaseDate.length === 8 ? { releaseDate } : {}),
          ...(officialSnsParsed ? { officialSns: officialSnsParsed } : {}),
        }
      : undefined;

  const metaRecord =
    parsed.meta && typeof parsed.meta === "object" && !Array.isArray(parsed.meta)
      ? (parsed.meta as Record<string, unknown>)
      : undefined;

  /** タグライン: ACF キー名は `tagline_filed` */
  const taglineRaw =
    scalarToTrimmedString(acf?.tagline_filed) ||
    scalarToTrimmedString(metaRecord?.tagline) ||
    scalarToTrimmedString(acf?.tagline);
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
  const goodPoints = splitGoodPoints(acf?.good_point_filed);
  const actors = mapActors(parsed);
  const streamingVods = buildStreamingVods(parsed);
  const rentalServices = buildRentalServices(parsed);

  const trailerVideo: { trailerEmbedCode?: string; trailerYoutubeId?: string } = {};
  if (trailerEmbedCode) {
    trailerVideo.trailerEmbedCode = trailerEmbedCode;
  } else if (trailerYoutubeId) {
    trailerVideo.trailerYoutubeId = trailerYoutubeId;
  }

  const heroGenres = extractGenreLinksFromParsedWp(parsed);
  const heroTags = extractPostTagLinksFromParsedWp(parsed);

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
    ...(heroGenres.length > 0 ? { heroGenres } : {}),
    ...(heroTags.length > 0 ? { heroTags } : {}),
    shareUrl: `${SITE_URL.replace(/\/$/, "")}${base.slug}`,
  };
};

export const extractPostsGroupSpecsFromWp = (wp: unknown): { heading: string; ids: number[] }[] => {
  const p = parseWPPostUnknown(wp);
  if (!p) return [];
  return extractPostsGroupIds(p.acf as Record<string, unknown> | undefined);
};
