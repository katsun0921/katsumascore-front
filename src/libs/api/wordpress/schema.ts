/**
 * WordPress REST の投稿・カテゴリ・タグレスポンス用 Zod スキーマとパーサ。
 */
import { z } from "zod";

const renderedBlock = z.object({
  rendered: z.string(),
});

/** ACF review_score: coerce; 小数点第1位まで保持（1.0〜5.0）。範囲外は omit。 */
const optionalReviewScore = z.preprocess((arg: unknown) => {
  if (arg == null || arg === "") return undefined;
  const n = typeof arg === "string" ? Number.parseFloat(arg) : Number(arg);
  if (!Number.isFinite(n)) return undefined;
  const r = Math.round(n * 10) / 10;
  if (r < 1 || r > 5) return undefined;
  return r;
}, z.number().min(1).max(5).optional());

const featuredMediaItemSchema = z
  .object({
    source_url: z.string(),
  })
  .passthrough();

/** `_embedded` の代表フィールド（アイキャッチ・ターム群）。 */
export const WPEmbeddedSchema = z
  .object({
    "wp:featuredmedia": z.array(featuredMediaItemSchema).optional(),
    "wp:term": z
      .array(z.array(z.object({ name: z.string(), slug: z.string().optional() }).passthrough()))
      .optional(),
  })
  .passthrough();

/** ACF 等で使う真偽値のゆるい解釈 */
const looseBool = z.preprocess((v: unknown) => {
  if (v === "1" || v === 1 || v === true) return true;
  if (v === "0" || v === 0 || v === false || v === "" || v == null) return false;
  return Boolean(v);
}, z.boolean());

/** 本番で `acf_summary_group: null` が返ると子 object 型と不一致になり ACF 全体の parse が落ちるため正規化する */
const acfSummaryGroupSchema = z.preprocess(
  (v) => {
    if (v == null || v === false) return undefined;
    return v;
  },
  z
    .object({
      summary_jp: z.string().optional(),
      summary_en: z.string().optional(),
    })
    .passthrough()
    .optional(),
);

/** REST では `name` 空で `actor` が ID / 投稿オブジェクトになることがある（オブジェクトは unknown で通す） */
const actorFieldSchema = z
  .object({
    name: z.string().optional(),
    character: z.string().optional(),
    description: z.string().optional(),
    actor: z.unknown().optional(),
    role: z.string().optional(),
  })
  .passthrough();

const rentalRowSchema = z.object({
  service: z.string(),
  url: z.string(),
});

const displaySettingsSchema = z
  .object({
    is_featured: looseBool.optional(),
  })
  .passthrough()
  .optional();

/** REST が `lang: "JA"` や空文字・想定外の型を返すと ACF オブジェクト全体の parse が落ちるため、有効値のみ通す。 */
const acfLangFromRest = z.preprocess((v: unknown) => {
  if (v == null || v === "") return undefined;
  if (typeof v === "string") {
    const t = v.trim().toLowerCase();
    if (t === "ja" || t === "en") return t;
    return undefined;
  }
  return undefined;
}, z.enum(["ja", "en"]).optional());

const wpPostAcfObjectSchema = z
  .object({
    lang: acfLangFromRest,
    review_score: optionalReviewScore,
    acf_summary_group: acfSummaryGroupSchema,
    actors_filed: z.array(actorFieldSchema).optional(),
    good_point_filed: z.unknown().optional(),
    official_url: z.string().optional(),
    official_sns: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
    /** ACF VOD配信サービス: status === "streaming" のとき配信中 */
    amazon_prime_video: z.object({ status: z.union([z.string(), z.literal(false)]) }).passthrough().optional(),
    netflix: z.object({ status: z.union([z.string(), z.literal(false)]) }).passthrough().optional(),
    hulu: z.object({ status: z.union([z.string(), z.literal(false)]) }).passthrough().optional(),
    unext: z.object({ status: z.union([z.string(), z.literal(false)]) }).passthrough().optional(),
    is_cinema_showing: looseBool.optional(),
    trailer_youtube_id: z.string().optional(),
    trailer_youtube: z.string().optional(),
    /** 記事紹介ショート動画（YouTube Shorts の URL または動画 ID） */
    short_video: z.string().optional(),
    rating: z.string().optional(),
    /** 本番で数値や空が混ざると string 解釈で ACF 全体の parse が落ちるため緩める */
    author_comment: z.preprocess(
      (v) => {
        if (v == null || v === "") return undefined;
        if (typeof v === "number" && Number.isFinite(v)) return String(v);
        return v;
      },
      z.string().optional(),
    ),
    rental_services: z.array(rentalRowSchema).optional(),
    release_date: z.string().optional(),
    copyright: z.string().optional(),
    /** タイトル上のタグライン（本番 post meta / ACF キー名 `tagline`） */
    tagline: z.preprocess(
      (v) => {
        if (v == null || v === "") return undefined;
        if (typeof v === "number" && Number.isFinite(v)) return String(v);
        return v;
      },
      z.string().optional(),
    ),
    display_settings: displaySettingsSchema,
  })
  .passthrough();

/** Production WP may return `acf: []` when REST exposes an empty list; coerce to undefined. */
const acfFromRest = z.preprocess((v: unknown) => {
  if (v == null) return undefined;
  if (Array.isArray(v)) return undefined;
  if (typeof v !== "object") return undefined;
  return v;
}, wpPostAcfObjectSchema.optional());

/** REST が `null` を返す環境があるため、アイキャッチ未設定を 0 に正規化する。 */
const featuredMediaIdFromRest = z.preprocess((v: unknown) => {
  if (v == null || v === "") return 0;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}, z.number());

/** 投稿 1 件の REST 形（ACF は寛容に `.passthrough()`）。 */
export const WPPostSchema = z
  .object({
    id: z.coerce.number(),
    slug: z.string(),
    link: z.string().optional(),
    title: renderedBlock,
    content: renderedBlock,
    excerpt: renderedBlock,
    date: z.string(),
    modified: z.string().optional(),
    featured_media: featuredMediaIdFromRest,
    meta: z.preprocess(
      (v) => {
        if (v == null || typeof v !== "object" || Array.isArray(v)) return undefined;
        return v;
      },
      z.record(z.string(), z.unknown()).optional(),
    ),
    _embedded: WPEmbeddedSchema.optional(),
    acf: acfFromRest,
  })
  .passthrough();

/** カテゴリターム。 */
export const WPCategorySchema = z
  .object({
    id: z.number(),
    slug: z.string(),
    name: z.string(),
    count: z.number(),
    parent: z.number(),
  })
  .passthrough();

/** 投稿タグターム。 */
export const WPTagSchema = z
  .object({
    id: z.number(),
    slug: z.string(),
    name: z.string(),
    count: z.number(),
  })
  .passthrough();

export type ParsedWPPost = z.infer<typeof WPPostSchema>;

/** `WPPostSchema` で検証し、失敗時は `null`。 */
export const parseWPPost = (data: unknown): ParsedWPPost | null => {
  const r = WPPostSchema.safeParse(data);
  return r.success ? r.data : null;
};
