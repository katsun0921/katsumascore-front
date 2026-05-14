/**
 * WP 投稿レスポンスの HTML 除去・タクソノミー抽出・正規化 `Post` へのマッピング。
 */
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

/** 簡易的なタグ除去と主要エンティティのデコード、前後トリム。 */
export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();

/** 固定ページのタイトル文字列と本文 HTML を正規化する。 */
export const normalizePageContent = (page: WPPageLike): NormalizedPageContent => ({
  title: stripHtml(page.title.rendered),
  html: page.content?.rendered ?? null,
});

/** 検索のタイトル次元: WP `title.rendered` のみ */
export const titleSearchBlobFromParsedWp = (wp: ParsedWPPost): string =>
  stripHtml(wp.title.rendered);

/** `WPPostSchema` で検証し、成功時のみパース済みオブジェクトを返す。 */
export const parseWPPostUnknown = (wp: unknown): ParsedWPPost | null => {
  const parsed = WPPostSchema.safeParse(wp);
  return parsed.success ? parsed.data : null;
};

type TermLike = { name?: unknown; slug?: unknown; taxonomy?: unknown; acf?: unknown };

/** `wp_` 接頭辞を除き小文字化したタクソノミー識別子。 */
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

/** レコードからキー順に最初の非空文字列を返す。 */
const pickFirstString = (r: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v.trim() !== "") return v.trim();
  }
  return undefined;
};

/** ターム ACF から多言語表示名（ja / en）を抽出する。 */
const extractTermAcfNames = (acfRaw: unknown): { ja?: string; en?: string } | undefined => {
  if (acfRaw === false || acfRaw === null || acfRaw === undefined) return undefined;
  if (typeof acfRaw !== "object" || Array.isArray(acfRaw)) return undefined;
  const r = acfRaw as Record<string, unknown>;
  const ja = pickFirstString(r, ["name_ja", "genre_name_ja", "tag_name_ja"]);
  const en = pickFirstString(r, ["name_en", "genre_name_en", "tag_name_en"]);
  if (ja === undefined && en === undefined) return undefined;
  return { ...(ja !== undefined ? { ja } : {}), ...(en !== undefined ? { en } : {}) };
};

/** ひらがな・カタカナ・漢字のいずれかを含むか。 */
const containsJapaneseText = (value: string): boolean =>
  /[\u3040-\u30ff\u3400-\u9fff]/.test(value);

/** スラッグを単語区切りの見出し風英字ラベルにする（en 表示のフォールバック）。 */
const slugToEnglishLabel = (slug: string): string =>
  slug
    .replace(/[-_]+/g, " ")
    .replace(/\b[a-z]/g, (char) => char.toUpperCase());

/** ロケールと ACF 名・REST 名から一覧表示用のターム名を決める。 */
const termDisplayName = (term: TermLike, name: string, slug: string, locale?: string): string => {
  const acfNames = extractTermAcfNames(term.acf);
  if (locale === "en" && acfNames?.en) return acfNames.en;
  if (locale === "en" && !containsJapaneseText(name)) return name;
  if (locale === "en") return slugToEnglishLabel(slug);
  if (acfNames?.ja) return acfNames.ja;
  return name;
};

/** 埋め込みタームから、指定タクソノミー集合に属する `{ name, slug }` を重複除去で列挙。 */
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

/** パース済み WP 投稿をアプリの `Post`（`content` 含む）へ変換する。 */
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

/** 未検証の WP 投稿をパースしてから `Post` へマップする。失敗時は `null`。 */
export const mapWPPostToPost = (wp: unknown): (Post & { content: string }) | null => {
  const parsed = parseWPPostUnknown(wp);
  if (!parsed) return null;
  return mapParsedWPPostToPost(parsed);
};

// ─── Person / Company 正規化 ────────────────────────────────────────────────

import type { Person, Company, PersonRole, CompanyRole } from "@/types/entity";

/** `acf.image` / `acf.logo` フィールドから URL を抽出する（object / 文字列 / null を吸収）。 */
const extractAcfImageUrl = (v: unknown): string | null => {
  if (!v) return null;
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "object" && "url" in v) {
    const url = (v as Record<string, unknown>).url;
    if (typeof url === "string") return url.trim() || null;
  }
  return null;
};

/** WP CPT `person` のレスポンスを正規化済み `Person` へ変換する。 */
export const mapWPPersonToPerson = (raw: unknown): Person | null => {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === "number" ? r.id : Number.parseInt(String(r.id ?? ""), 10);
  if (!Number.isFinite(id)) return null;
  const slug = typeof r.slug === "string" ? r.slug.trim() : "";
  if (!slug) return null;

  const titleObj = r.title as Record<string, unknown> | undefined;
  const titleRendered = typeof titleObj?.rendered === "string" ? stripHtml(titleObj.rendered) : "";

  const acf = r.acf && typeof r.acf === "object" && !Array.isArray(r.acf)
    ? (r.acf as Record<string, unknown>)
    : {};

  const name =
    (typeof acf.name === "string" && acf.name.trim()) ||
    titleRendered ||
    slug;

  const rawRoles = Array.isArray(acf.roles) ? acf.roles : [];
  const VALID_PERSON_ROLES = new Set<PersonRole>(["actor", "director"]);
  const roles: PersonRole[] = rawRoles
    .filter((v): v is string => typeof v === "string")
    .filter((v): v is PersonRole => VALID_PERSON_ROLES.has(v as PersonRole));

  const bio = typeof acf.bio === "string" ? acf.bio.trim() || undefined : undefined;
  const image = extractAcfImageUrl(acf.image);

  return {
    id: String(id),
    slug,
    name,
    roles,
    ...(bio !== undefined ? { bio } : {}),
    image: image ?? null,
  };
};

/** WP CPT `company` のレスポンスを正規化済み `Company` へ変換する。 */
export const mapWPCompanyToCompany = (raw: unknown): Company | null => {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === "number" ? r.id : Number.parseInt(String(r.id ?? ""), 10);
  if (!Number.isFinite(id)) return null;
  const slug = typeof r.slug === "string" ? r.slug.trim() : "";
  if (!slug) return null;

  const titleObj = r.title as Record<string, unknown> | undefined;
  const titleRendered = typeof titleObj?.rendered === "string" ? stripHtml(titleObj.rendered) : "";

  const acf = r.acf && typeof r.acf === "object" && !Array.isArray(r.acf)
    ? (r.acf as Record<string, unknown>)
    : {};

  const name =
    (typeof acf.name === "string" && acf.name.trim()) ||
    titleRendered ||
    slug;

  const rawRoles = Array.isArray(acf.roles) ? acf.roles : [];
  const VALID_COMPANY_ROLES = new Set<CompanyRole>(["production", "distributor"]);
  const roles: CompanyRole[] = rawRoles
    .filter((v): v is string => typeof v === "string")
    .filter((v): v is CompanyRole => VALID_COMPANY_ROLES.has(v as CompanyRole));

  const description =
    typeof acf.description === "string" ? acf.description.trim() || undefined : undefined;
  const logo = extractAcfImageUrl(acf.logo);

  return {
    id: String(id),
    slug,
    name,
    roles,
    ...(description !== undefined ? { description } : {}),
    logo: logo ?? null,
  };
};
