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
      .array(z.array(z.object({ name: z.string() }).passthrough()))
      .optional(),
  })
  .passthrough();

export const WPPostSchema = z
  .object({
    id: z.number(),
    slug: z.string(),
    title: renderedBlock,
    content: renderedBlock,
    excerpt: renderedBlock,
    date: z.string(),
    featured_media: z.number(),
    _embedded: WPEmbeddedSchema.optional(),
    acf: z
      .object({
        review_score: optionalReviewScore,
      })
      .passthrough()
      .optional(),
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
