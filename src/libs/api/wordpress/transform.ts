/**
 * WP 投稿レスポンスの HTML 除去・タクソノミー抽出・正規化 `Post` へのマッピング。
 */
import type { Post } from "@/types/post";
import { WPPostSchema } from "./schema";
import type { ParsedWPPost } from "./schema";
import { detectLang } from "./lang";
import { getPostUrl, resolvePostType } from "@/libs/route";
import { extractYoutubeVideoId } from "@/libs/buildPostDetailFromWp/youtube";

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
const PERSON_TAXONOMIES = new Set(["person", "persons"]);

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
export const extractActorTermNamesFromParsedWp = (wp: ParsedWPPost): string[] =>
  extractActorLinksFromParsedWp(wp).map((l) => l.name);

/** `_embedded['wp:term']` の director / directors ターム名（スラッグ不要・スタッフ表示用） */
export const extractDirectorTermNamesFromParsedWp = (wp: ParsedWPPost): string[] =>
  extractDirectorLinksFromParsedWp(wp).map((l) => l.name);

/** `_embedded['wp:term']` から actor / actors タクソノミーの `{ name, slug }` を抽出 */
export const extractActorLinksFromParsedWp = (wp: ParsedWPPost): PostTaxonomyLink[] =>
  extractTaxonomyLinks(wp, ACTOR_TAXONOMIES);

/** `_embedded['wp:term']` から director / directors タクソノミーの `{ name, slug }` を抽出 */
export const extractDirectorLinksFromParsedWp = (wp: ParsedWPPost): PostTaxonomyLink[] =>
  extractTaxonomyLinks(wp, DIRECTOR_TAXONOMIES);

/** `_embedded['wp:term']` から person / persons タクソノミーの `{ name, slug }` を抽出 */
export const extractPersonLinksFromParsedWp = (wp: ParsedWPPost): PostTaxonomyLink[] =>
  extractTaxonomyLinks(wp, PERSON_TAXONOMIES);

export type FranchiseTerm = { id: number; name: string; slug: string };

/** `_embedded['wp:term']` から franchise タクソノミーのターム（ID・名前・スラッグ）を抽出。 */
export const extractFranchiseTermsFromParsedWp = (wp: ParsedWPPost): FranchiseTerm[] => {
  const groups = wp._embedded?.["wp:term"];
  if (!Array.isArray(groups)) return [];
  const seen = new Set<number>();
  const out: FranchiseTerm[] = [];
  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const term of group) {
      const t = term as Record<string, unknown>;
      const tax = typeof t.taxonomy === "string" ? normalizeTaxonomy(t.taxonomy) : "";
      if (tax !== "franchise") continue;
      const id = typeof t.id === "number" ? t.id : null;
      if (id === null || seen.has(id)) continue;
      const name = typeof t.name === "string" ? t.name.trim() : "";
      const slug = typeof t.slug === "string" ? t.slug.trim() : "";
      if (!name || !slug) continue;
      seen.add(id);
      out.push({ id, name, slug });
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
  if ((acf?.amazon_prime_video as { status?: unknown } | undefined)?.status === "streaming") vodList.push("prime-video");
  if ((acf?.netflix as { status?: unknown } | undefined)?.status === "streaming") vodList.push("netflix");
  if ((acf?.hulu as { status?: unknown } | undefined)?.status === "streaming") vodList.push("hulu");
  if ((acf?.unext as { status?: unknown } | undefined)?.status === "streaming") vodList.push("unext");
  const vods = vodList.length > 0 ? vodList : undefined;

  const shortVideoId = extractYoutubeVideoId(acf?.short_movie?.youtube);

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
    updatedAt: (wp.modified ?? wp.date).slice(0, 10),
    lang,
    type,
    ...(category !== undefined ? { category } : {}),
    ...(rs !== undefined ? { score: rs } : {}),
    ...(isFeatured ? { isFeatured } : {}),
    ...(vods && vods.length > 0 ? { vods } : {}),
    ...(genres.length > 0 ? { genres } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    ...(year !== undefined ? { year } : {}),
    ...(shortVideoId !== undefined ? { shortVideoId } : {}),
  };
};

/** 未検証の WP 投稿をパースしてから `Post` へマップする。失敗時は `null`。 */
export const mapWPPostToPost = (wp: unknown): (Post & { content: string }) | null => {
  const parsed = parseWPPostUnknown(wp);
  if (!parsed) return null;
  return mapParsedWPPostToPost(parsed);
};

export interface PersonSnsLink {
  platform: "x" | "instagram" | "youtube" | "tiktok" | "facebook" | "other";
  url: string;
}

export interface PersonFaqItem {
  question: string;
  answer: string;
  questionEn: string;
  answerEn: string;
}

export interface PersonAward {
  year: string;
  awardName: string;
  workTitle: string;
  result: "win" | "nomination" | "";
}

export interface Person {
  id: number;
  slug: string;
  nameJa: string;
  nameEn: string;
  roles: ("actor" | "actress" | "director" | "voice_actor")[];
  birthDate: string;
  deathDate: string;
  /** `country` タクソノミーのターム名（複数国籍を考慮し配列） */
  nationality: string[];
  activeYears: string;
  gender: "male" | "female" | "other" | "";
  officialUrl: string;
  officialSns: PersonSnsLink[];
  aiSummary: string;
  aiCareer: string;
  aiStrength: string;
  aiStyle: string;
  aiTheme: string;
  aiPosition: string;
  aiNotableReason: string;
  /** 英語版（手動翻訳・未入力の場合は空文字。表示側で日本語版へフォールバックする） */
  aiSummaryEn: string;
  aiCareerEn: string;
  aiStrengthEn: string;
  aiStyleEn: string;
  aiThemeEn: string;
  aiPositionEn: string;
  aiNotableReasonEn: string;
  faq: PersonFaqItem[];
  awards: PersonAward[];
}

export interface Company {
  id: number;
  slug: string;
  nameJa: string;
  nameEn: string;
  roles: ("production" | "distributor")[];
  description: string;
  logo: {
    url: string;
    alt: string;
  } | null;
}

type WPPerson = import("./generated/wp-schema").components["schemas"]["WPPerson"];
type WPCompany = import("./generated/wp-schema").components["schemas"]["WPCompany"];

/** WPPerson の `_embedded['wp:term']`（要 `_embed`）から国籍（`country` タクソノミー）のターム名を抽出する。 */
const extractCountryNamesFromWPPerson = (wp: WPPerson): string[] => {
  const groups = wp._embedded?.["wp:term"];
  if (!Array.isArray(groups)) return [];
  const out: string[] = [];
  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const term of group) {
      if (term.taxonomy === "country" && term.name) out.push(term.name);
    }
  }
  return out;
};

/** WPPerson をアプリの `Person` 型へ変換する。 */
export const transformPerson = (wp: WPPerson): Person => {
  const acf = wp.acf;
  const titleFallback = stripHtml(wp.title?.rendered ?? "");
  // ACF repeater は空のとき false を返すため配列判定してから使う
  const officialSns = Array.isArray(acf.official_sns)
    ? acf.official_sns.filter((sns) => !!sns.url)
    : [];
  const faq: PersonFaqItem[] = Array.isArray(acf.ai_faq)
    ? acf.ai_faq
        .filter((item) => !!item.question && !!item.answer)
        .map((item) => ({
          question: item.question,
          answer: item.answer,
          questionEn: item.question_en ?? "",
          answerEn: item.answer_en ?? "",
        }))
    : [];
  const awards: PersonAward[] = Array.isArray(acf.ai_awards)
    ? acf.ai_awards
        .filter((item) => !!item.award_name)
        .map((item) => ({
          year: item.year ?? "",
          awardName: item.award_name ?? "",
          workTitle: item.work_title ?? "",
          result: item.result ?? "",
        }))
    : [];
  return {
    id: wp.id,
    slug: wp.slug,
    nameJa: acf.name_ja || titleFallback,
    nameEn: acf.name_en || titleFallback,
    roles: acf.roles ?? [],
    birthDate: acf.birth_date ?? "",
    deathDate: acf.death_date ?? "",
    nationality: extractCountryNamesFromWPPerson(wp),
    activeYears: acf.active_years ?? "",
    gender: acf.gender ?? "",
    officialUrl: acf.official_url ?? "",
    officialSns,
    aiSummary: acf.ai_summary?.ai_summary_ja ?? "",
    aiCareer: acf.ai_career?.ai_career_ja ?? "",
    aiStrength: acf.ai_strength?.ai_strength_ja ?? "",
    aiStyle: acf.ai_style?.ai_style_ja ?? "",
    aiTheme: acf.ai_theme?.ai_theme_ja ?? "",
    aiPosition: acf.ai_position?.ai_position_ja ?? "",
    aiNotableReason: acf.ai_notable_reason?.ai_notable_reason_ja ?? "",
    aiSummaryEn: acf.ai_summary?.ai_summary_en ?? "",
    aiCareerEn: acf.ai_career?.ai_career_en ?? "",
    aiStrengthEn: acf.ai_strength?.ai_strength_en ?? "",
    aiStyleEn: acf.ai_style?.ai_style_en ?? "",
    aiThemeEn: acf.ai_theme?.ai_theme_en ?? "",
    aiPositionEn: acf.ai_position?.ai_position_en ?? "",
    aiNotableReasonEn: acf.ai_notable_reason?.ai_notable_reason_en ?? "",
    faq,
    awards,
  };
};

/** WPCompany をアプリの `Company` 型へ変換する。 */
export const transformCompany = (wp: WPCompany): Company => {
  const acf = wp.acf;
  return {
    id: wp.id,
    slug: wp.slug,
    nameJa: acf.name_ja ?? "",
    nameEn: acf.name_en ?? "",
    roles: acf.roles ?? [],
    description: acf.description ?? "",
    logo: acf.logo
      ? {
          url: acf.logo.url,
          alt: acf.logo.alt ?? acf.name_ja,
        }
      : null,
  };
};
