import type { WPPost, WPCategory, WPTag } from "@/types/wordpress";
import type { Post } from "@/components/features/Post/types/post";

// Strip HTML tags and decode basic entities — used to clean WP excerpt
const stripHtml = (html: string): string =>
  html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim();

export const mapWPPostToPost = (wp: WPPost): Post & { content: string } => {
  const image = wp._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
  // wp:term is an array of term arrays: [[categories...], [tags...]]
  const terms = (wp._embedded as Record<string, unknown> | undefined)?.["wp:term"];
  const categories = Array.isArray(terms) ? (terms[0] as Array<{ name: string }> | undefined) : undefined;
  const category = categories?.[0]?.name;

  return {
    id: String(wp.id),
    slug: `/posts/${wp.slug}`,
    title: wp.title.rendered,
    excerpt: stripHtml(wp.excerpt.rendered),
    content: wp.content.rendered,
    image: image ?? null,
    publishedAt: wp.date.slice(0, 10), // "2026-04-01T..." → "2026-04-01"
    category,
    score: wp.acf?.review_score,
  };
}

const BASE_URL = process.env.WP_API_URL;

const wpFetch = async <T>(path: string, params: Record<string, string | number> = {}): Promise<T | null> => {
  try {
    const url = new URL(`${BASE_URL}${path}`);
    url.searchParams.set("_embed", "1");
    url.searchParams.set("acf_format", "standard");
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export const getPosts = async (params: {
  page?: number;
  per_page?: number;
  lang?: string;
  category?: number;
} = {}): Promise<WPPost[]> => {
  const query: Record<string, string | number> = {};
  if (params.page) query.page = params.page;
  if (params.per_page) query.per_page = params.per_page;
  if (params.lang) query.lang = params.lang;
  if (params.category) query.categories = params.category;
  return (await wpFetch<WPPost[]>("/posts", query)) ?? [];
}

export const getPostBySlug = async (slug: string, lang?: string): Promise<WPPost | null> => {
  const query: Record<string, string | number> = { slug };
  if (lang) query.lang = lang;
  const posts = await wpFetch<WPPost[]>("/posts", query);
  return posts?.[0] ?? null;
}

export const getCategories = async (lang?: string): Promise<WPCategory[]> => {
  const query: Record<string, string | number> = {};
  if (lang) query.lang = lang;
  return (await wpFetch<WPCategory[]>("/categories", query)) ?? [];
}

export const getPostsByCategory = async (categoryId: number, lang?: string): Promise<WPPost[]> =>
  getPosts({ category: categoryId, lang });

export const getRelatedPosts = async (ids: number[]): Promise<WPPost[]> => {
  if (ids.length === 0) return [];
  return (await wpFetch<WPPost[]>("/posts", { include: ids.join(",") })) ?? [];
}

export const searchPosts = async (query: string, lang?: string): Promise<WPPost[]> => {
  const params: Record<string, string | number> = { search: query };
  if (lang) params.lang = lang;
  return (await wpFetch<WPPost[]>("/posts", params)) ?? [];
}

export const getTags = async (lang?: string): Promise<WPTag[]> => {
  const params: Record<string, string | number> = { per_page: 100 };
  if (lang) params.lang = lang;
  return (await wpFetch<WPTag[]>("/tags", params)) ?? [];
}
