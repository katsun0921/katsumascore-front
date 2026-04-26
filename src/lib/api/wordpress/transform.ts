import type { Post } from "@/types/post";
import { WPPostSchema } from "./schema";
import type { ParsedWPPost } from "./schema";

export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();

const titleFromWp = (wp: ParsedWPPost): string => {
  const jp = wp.acf?.title_jp?.trim();
  if (jp) return stripHtml(jp);
  return stripHtml(wp.title.rendered);
};

export const parseWPPostUnknown = (wp: unknown): ParsedWPPost | null => {
  const parsed = WPPostSchema.safeParse(wp);
  return parsed.success ? parsed.data : null;
};

const mapParsedWPPostToPost = (wp: ParsedWPPost): Post & { content: string } => {
  const image = wp._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
  const terms = wp._embedded?.["wp:term"];
  const categories = Array.isArray(terms) ? terms[0] : undefined;
  const category = categories?.[0]?.name;

  const rs = wp.acf?.review_score;
  return {
    id: String(wp.id),
    slug: `/posts/${wp.slug}`,
    title: titleFromWp(wp),
    excerpt: stripHtml(wp.excerpt.rendered),
    content: wp.content.rendered,
    image: image ?? null,
    publishedAt: wp.date.slice(0, 10),
    ...(category !== undefined ? { category } : {}),
    ...(rs !== undefined ? { score: rs } : {}),
  };
};

export const mapWPPostToPost = (wp: unknown): (Post & { content: string }) | null => {
  const parsed = parseWPPostUnknown(wp);
  if (!parsed) return null;
  return mapParsedWPPostToPost(parsed);
};
