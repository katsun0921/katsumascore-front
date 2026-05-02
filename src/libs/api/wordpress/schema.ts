import { z } from "zod";

const renderedBlock = z.object({
  rendered: z.string(),
});

/** ACF review_score: coerce; omit when missing or out of 1–5 */
const optionalReviewScore = z.preprocess((arg: unknown) => {
  if (arg == null || arg === "") return undefined;
  const n = typeof arg === "string" ? Number.parseFloat(arg) : Number(arg);
  if (!Number.isFinite(n)) return undefined;
  const r = Math.round(n);
  if (r < 1 || r > 5) return undefined;
  return r;
}, z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional());

const featuredMediaItemSchema = z
  .object({
    source_url: z.string(),
  })
  .passthrough();

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

const wpPostAcfObjectSchema = z
  .object({
    lang: z.enum(["ja", "en"]).optional(),
    review_score: optionalReviewScore,
    title_jp: z.string().optional(),
    title_en: z.string().optional(),
    acf_summary_group: acfSummaryGroupSchema,
    actors_filed: z.array(actorFieldSchema).optional(),
    good_point_filed: z.unknown().optional(),
    official_url: z.string().optional(),
    official_sns: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
    streaming_vod_netflix: looseBool.optional(),
    streaming_vod_amazon: looseBool.optional(),
    streaming_vod_unext: looseBool.optional(),
    is_cinema_showing: looseBool.optional(),
    trailer_youtube_id: z.string().optional(),
    trailer_youtube: z.string().optional(),
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

export const WPPostSchema = z
  .object({
    id: z.number(),
    slug: z.string(),
    link: z.string().optional(),
    title: renderedBlock,
    content: renderedBlock,
    excerpt: renderedBlock,
    date: z.string(),
    modified: z.string().optional(),
    featured_media: z.number(),
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

export const WPCategorySchema = z
  .object({
    id: z.number(),
    slug: z.string(),
    name: z.string(),
    count: z.number(),
    parent: z.number(),
  })
  .passthrough();

export const WPTagSchema = z
  .object({
    id: z.number(),
    slug: z.string(),
    name: z.string(),
    count: z.number(),
  })
  .passthrough();

export type ParsedWPPost = z.infer<typeof WPPostSchema>;

export const parseWPPost = (data: unknown): ParsedWPPost | null => {
  const r = WPPostSchema.safeParse(data);
  return r.success ? r.data : null;
};
