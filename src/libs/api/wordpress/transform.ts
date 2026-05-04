import type { Post } from "@/types/post";
import { WPPostSchema } from "./schema";
import type { ParsedWPPost } from "./schema";
import { detectLang } from "./lang";
import { getPostUrl, resolvePostType } from "@/libs/route";

type WPPageLike = {
  title: { rendered: string };
  content?: { rendered?: string };
};

export type NormalizedPageContent = {
  title: string;
  html: string | null;
};

export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();

export const normalizePageContent = (page: WPPageLike): NormalizedPageContent => ({
  title: stripHtml(page.title.rendered),
  html: page.content?.rendered ?? null,
});

/** 検索のタイトル次元: WP `title.rendered` のみ */
export const titleSearchBlobFromParsedWp = (wp: ParsedWPPost): string =>
  stripHtml(wp.title.rendered);

export const parseWPPostUnknown = (wp: unknown): ParsedWPPost | null => {
  const parsed = WPPostSchema.safeParse(wp);
  return parsed.success ? parsed.data : null;
};

type TermLike = { name?: unknown; slug?: unknown; taxonomy?: unknown; acf?: unknown };

const normalizeTaxonomy = (raw: string): string => raw.replace(/^wp_/i, "").toLowerCase();

const GENRE_TAXONOMIES = new Set(["genre", "genres"]);
const POST_TAG_TAXONOMIES = new Set(["post_tag", "tag"]);
const FILM_STUDIO_TAXONOMIES = new Set(["film_studio"]);
const PRODUCTION_STUDIO_TAXONOMIES = new Set(["production_studio"]);
const DIRECTOR_TAXONOMIES = new Set(["director", "directors"]);
const ACTOR_TAXONOMIES = new Set(["actor", "actors"]);

export type PostTaxonomyLink = {
  name: string
  slug: string
};

const pickFirstString = (r: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v.trim() !== "") return v.trim();
  }
  return undefined;
};

const extractTermAcfNames = (acfRaw: unknown): { ja?: string; en?: string } | undefined => {
  if (acfRaw === false || acfRaw === null || acfRaw === undefined) return undefined;
  if (typeof acfRaw !== "object" || Array.isArray(acfRaw)) return undefined;
  const r = acfRaw as Record<string, unknown>;
  const ja = pickFirstString(r, ["name_ja", "genre_name_ja", "tag_name_ja"]);
  const en = pickFirstString(r, ["name_en", "genre_name_en", "tag_name_en"]);
  if (ja === undefined && en === undefined) return undefined;
  return { ...(ja !== undefined ? { ja } : {}), ...(en !== undefined ? { en } : {}) };
};

const containsJapaneseText = (value: string): boolean =>
  /[\u3040-\u30ff\u3400-\u9fff]/.test(value);

const slugToEnglishLabel = (slug: string): string =>
  slug
    .replace(/[-_]+/g, " ")
    .replace(/\b[a-z]/g, (char) => char.toUpperCase());

const termDisplayName = (term: TermLike, name: string, slug: string, locale?: string): string => {
  const acfNames = extractTermAcfNames(term.acf);
  if (locale === "en" && acfNames?.en) return acfNames.en;
  if (locale === "en" && !containsJapaneseText(name)) return name;
  if (locale === "en") return slugToEnglishLabel(slug);
  if (acfNames?.ja) return acfNames.ja;
  return name;
};

const extractTaxonomyLinks = (
  wp: ParsedWPPost,
  taxes: Set<string>,
  locale?: string,
): PostTaxonomyLink[] => {
  const groups = wp._embedded?.["wp:term"];
  if (!Array.isArray(groups)) return [];
  const seen = new Set<string>();
  const out: PostTaxonomyLink[] = [];
  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const term of group) {
      const t = term as TermLike;
      const name = typeof t.name === "string" ? t.name.trim() : "";
      const slug = typeof t.slug === "string" ? t.slug.trim() : "";
      const taxRaw = typeof t.taxonomy === "string" ? t.taxonomy.trim() : "";
      if (!name || !slug) continue;
      const tax = normalizeTaxonomy(taxRaw);
      if (!taxes.has(tax)) continue;
      if (seen.has(slug)) continue;
      seen.add(slug);
      out.push({ name: termDisplayName(t, name, slug, locale), slug });
    }
  }
  return out;
};

/** `_embedded['wp:term']` から genre / genres タクソノミーのリンク用データを抽出 */
export const extractGenreLinksFromParsedWp = (wp: ParsedWPPost, locale?: string): PostTaxonomyLink[] =>
  extractTaxonomyLinks(wp, GENRE_TAXONOMIES, locale);

/** `_embedded['wp:term']` から post_tag（および tag）のリンク用データを抽出 */
export const extractPostTagLinksFromParsedWp = (wp: ParsedWPPost, locale?: string): PostTaxonomyLink[] =>
  extractTaxonomyLinks(wp, POST_TAG_TAXONOMIES, locale);

/** `_embedded['wp:term']` から film_studio（配給会社）のリンク用データを抽出 */
export const extractFilmStudioLinksFromParsedWp = (wp: ParsedWPPost): PostTaxonomyLink[] =>
  extractTaxonomyLinks(wp, FILM_STUDIO_TAXONOMIES);

/** `_embedded['wp:term']` から production_studio（制作会社）のリンク用データを抽出 */
export const extractProductionStudioLinksFromParsedWp = (wp: ParsedWPPost): PostTaxonomyLink[] =>
  extractTaxonomyLinks(wp, PRODUCTION_STUDIO_TAXONOMIES);

/** `_embedded['wp:term']` の actor / actors ターム名（出演者一覧のフォールバック） */
export const extractActorTermNamesFromParsedWp = (wp: ParsedWPPost): string[] => {
  const groups = wp._embedded?.["wp:term"];
  if (!Array.isArray(groups)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const term of group) {
      const t = term as TermLike;
      const name = typeof t.name === "string" ? t.name.trim() : "";
      const taxRaw = typeof t.taxonomy === "string" ? t.taxonomy.trim() : "";
      if (!name) continue;
      const tax = normalizeTaxonomy(taxRaw);
      if (!ACTOR_TAXONOMIES.has(tax)) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(name);
    }
  }
  return out;
};

/** `_embedded['wp:term']` の director / directors ターム名（スラッグ不要・スタッフ表示用） */
export const extractDirectorTermNamesFromParsedWp = (wp: ParsedWPPost): string[] => {
  const groups = wp._embedded?.["wp:term"];
  if (!Array.isArray(groups)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const term of group) {
      const t = term as TermLike;
      const name = typeof t.name === "string" ? t.name.trim() : "";
      const taxRaw = typeof t.taxonomy === "string" ? t.taxonomy.trim() : "";
      if (!name) continue;
      const tax = normalizeTaxonomy(taxRaw);
      if (!DIRECTOR_TAXONOMIES.has(tax)) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(name);
    }
  }
  return out;
};

const mapParsedWPPostToPost = (wp: ParsedWPPost): Post & { content: string } => {
  const image = wp._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
  const terms = wp._embedded?.["wp:term"];
  const categories = Array.isArray(terms) ? terms[0] : undefined;
  const category = categories?.[0]?.name;
  const categorySlug = categories?.[0]?.slug;
  const type = resolvePostType(categorySlug);

  const rs = wp.acf?.review_score;
  const acfLang = wp.acf?.lang;
  const lang = detectLang(wp.link, acfLang);
  const isFeatured = wp.acf?.display_settings?.is_featured === true;
  const genres = extractGenreLinksFromParsedWp(wp, lang);
  const tags = extractPostTagLinksFromParsedWp(wp, lang);

  const acf = wp.acf;
  const vodList: import("@/libs/vod").VodService[] = [];
  if (acf?.streaming_vod_netflix) vodList.push("netflix");
  if (acf?.streaming_vod_amazon) vodList.push("amazon");
  if (acf?.streaming_vod_unext) vodList.push("unext");
  const vods = vodList.length > 0 ? vodList : undefined;

  const releaseYear = wp.acf?.release_date
    ? Number.parseInt(wp.acf.release_date.slice(0, 4), 10)
    : undefined;
  const year = releaseYear !== undefined && Number.isFinite(releaseYear) ? releaseYear : undefined;

  const title = stripHtml(wp.title.rendered);

  return {
    id: String(wp.id),
    slug: getPostUrl(type, wp.slug, lang),
    title,
    excerpt: stripHtml(wp.excerpt.rendered),
    content: wp.content.rendered,
    image: image ?? null,
    publishedAt: wp.date.slice(0, 10),
    lang,
    type,
    ...(category !== undefined ? { category } : {}),
    ...(rs !== undefined ? { score: rs } : {}),
    ...(isFeatured ? { isFeatured } : {}),
    ...(vods && vods.length > 0 ? { vods } : {}),
    ...(genres.length > 0 ? { genres } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    ...(year !== undefined ? { year } : {}),
  };
};

export const mapWPPostToPost = (wp: unknown): (Post & { content: string }) | null => {
  const parsed = parseWPPostUnknown(wp);
  if (!parsed) return null;
  return mapParsedWPPostToPost(parsed);
};
