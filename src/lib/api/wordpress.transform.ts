import type { Post } from "@/types/post";
import { WPPostSchema } from "@/lib/api/wordpress.schema";
import type { ParsedWPPost } from "@/lib/api/wordpress.schema";

export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();

const mapParsedWPPostToPost = (wp: ParsedWPPost): Post & { content: string } => {
  const image = wp._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
  const terms = wp._embedded?.["wp:term"];
  const categories = Array.isArray(terms) ? terms[0] : undefined;
  const category = categories?.[0]?.name;

  return {
    id: String(wp.id),
    slug: `/posts/${wp.slug}`,
    title: wp.title.rendered,
    excerpt: stripHtml(wp.excerpt.rendered),
    content: wp.content.rendered,
    image: image ?? null,
    publishedAt: wp.date.slice(0, 10),
    category,
    score: wp.acf?.review_score,
  };
};

export const mapWPPostToPost = (wp: unknown): (Post & { content: string }) | null => {
  const parsed = WPPostSchema.safeParse(wp);
  if (!parsed.success) return null;
  return mapParsedWPPostToPost(parsed.data);
};
