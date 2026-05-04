/**
 * ACF `official_sns` のオブジェクト・配列・JSON 文字列など多形状を TitleMeta 用に正規化する。
 */
import type { TTitleMetaProps } from "@/components/features/Post/PostTitleMeta";

import { HTTP_URL_RE } from "./constants";

type OfficialSnsEntry = NonNullable<TTitleMetaProps["officialSns"]>[string];

/** 文字列またはオブジェクトの `link` / `url` / `href` から http(s) URL を取り出す。 */
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

/** CMS 埋め込みスニペットから &lt;script&gt; を除く（widgets / embed.js はフロントで読み込む） */
const stripSnsEmbedScripts = (html: string): string =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").trim();

/** 文字列が X（Twitter）埋め込み HTML なら script 除去後に返す。 */
const extractXEmbedHtmlFromString = (raw: string): string | undefined => {
  const t = raw.trim();
  if (!/twitter-tweet/i.test(t)) return undefined;
  return stripSnsEmbedScripts(t);
};

/** オブジェクト内の代表的キーから X 埋め込み HTML を探す。 */
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

/** 文字列が Instagram 埋め込み HTML なら script 除去後に返す。 */
const extractInstagramEmbedHtmlFromString = (raw: string): string | undefined => {
  const t = raw.trim();
  if (!/instagram-media/i.test(t) && !/data-instgrm-permalink/i.test(t)) return undefined;
  return stripSnsEmbedScripts(t);
};

/** オブジェクト内の代表的キーから Instagram 埋め込み HTML を探す。 */
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

/** 文字列が TikTok 埋め込み HTML なら script 除去後に返す。 */
const extractTikTokEmbedHtmlFromString = (raw: string): string | undefined => {
  const t = raw.trim();
  if (!/tiktok-embed/i.test(t) && !/tiktok\.com\/embed\//i.test(t)) return undefined;
  return stripSnsEmbedScripts(t);
};

/** オブジェクト内の代表的キーから TikTok 埋め込み HTML を探す。 */
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

/** URL が tiktok.com の動画／embed パスか。 */
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

/** 同一プラットフォームの `link` / `embedHtml` をマージする。 */
const mergeOfficialSnsEntry = (base: OfficialSnsEntry, add: OfficialSnsEntry): OfficialSnsEntry => {
  const merged: OfficialSnsEntry = {};
  const link = base.link ?? add.link;
  const embedHtml = base.embedHtml ?? add.embedHtml;
  if (link) merged.link = link;
  if (embedHtml) merged.embedHtml = embedHtml;
  return merged;
};

/** 正規化キー（小文字・空白→アンダースコア）→ TitleMeta 用プラットフォームキー */
const CANONICAL_KEY_BY_NORMALIZED_NAME: Record<string, string> = {
  twitter: "x",
  x: "x",
  youtube: "youtube_channel",
  youtube_channel: "youtube_channel",
  instagram: "instagram",
  tiktok: "tiktok",
  tik_tok: "tiktok",
};

/** 埋め込み HTML の内容から TitleMeta 用の正規プラットフォームキーを推測する。 */
const resolveCanonFromEmbedHtml = (embedHtml: string | undefined): string | undefined => {
  if (!embedHtml) return undefined;
  if (/twitter-tweet/i.test(embedHtml)) return "x";
  if (/tiktok-embed/i.test(embedHtml) || /tiktok\.com\/embed\//i.test(embedHtml)) return "tiktok";
  if (/instagram-media/i.test(embedHtml) || /data-instgrm-permalink/i.test(embedHtml)) return "instagram";
  return undefined;
};

type ResolveCanonicalSnsKeyArgs = {
  rawKey: string;
  embedHtml: string | undefined;
  link: string | undefined;
  linkOk: boolean;
};

/** フィールド名・埋め込み・リンクから TitleMeta が期待するキーへ寄せる。 */
const resolveCanonicalSnsKey = ({
  rawKey,
  embedHtml,
  link,
  linkOk,
}: ResolveCanonicalSnsKeyArgs): string => {
  const normalized = rawKey.toLowerCase().replace(/\s+/g, "_");
  const fromFieldName = CANONICAL_KEY_BY_NORMALIZED_NAME[normalized];
  if (fromFieldName) return fromFieldName;
  const fromEmbed = resolveCanonFromEmbedHtml(embedHtml);
  if (fromEmbed) return fromEmbed;
  if (linkOk && link && isTikTokVideoUrl(link)) return "tiktok";
  return rawKey;
};

/** 中間マップのキーを正規化し、同一サービス行をマージする。 */
const canonicalOfficialSnsKeys = (out: Record<string, OfficialSnsEntry>): Record<string, OfficialSnsEntry> => {
  const merged: Record<string, OfficialSnsEntry> = {};
  for (const [k, v] of Object.entries(out)) {
    const link = v?.link?.trim();
    const embedHtml = v?.embedHtml?.trim();
    const linkOk = Boolean(link && HTTP_URL_RE.test(link));
    if (!embedHtml && !linkOk) continue;
    const canon = resolveCanonicalSnsKey({ rawKey: k, embedHtml, link, linkOk });
    const next: OfficialSnsEntry = { ...(linkOk ? { link } : {}), ...(embedHtml ? { embedHtml } : {}) };
    merged[canon] = merged[canon] ? mergeOfficialSnsEntry(merged[canon], next) : next;
  }
  return merged;
};

/** ACF がオブジェクト辞書形式のときのパース。 */
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

/** ACF が `{ platform, link, embed }` 行の配列形式のときのパース。 */
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

/** 任意の CMS 値を公式 SNS マップへ変換。解釈できなければ `undefined`。 */
export const parseOfficialSns = (raw: unknown): TTitleMetaProps["officialSns"] => {
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
