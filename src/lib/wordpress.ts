import type { WPPost, WPCategory } from "@/types/wordpress";

const BASE_URL = process.env.WP_API_URL;

async function wpFetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T | null> {
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

export async function getPosts(params: {
  page?: number;
  per_page?: number;
  lang?: string;
  category?: number;
} = {}): Promise<WPPost[]> {
  const query: Record<string, string | number> = {};
  if (params.page) query.page = params.page;
  if (params.per_page) query.per_page = params.per_page;
  if (params.lang) query.lang = params.lang;
  if (params.category) query.categories = params.category;
  return (await wpFetch<WPPost[]>("/posts", query)) ?? [];
}

export async function getPostBySlug(slug: string, lang?: string): Promise<WPPost | null> {
  const query: Record<string, string | number> = { slug };
  if (lang) query.lang = lang;
  const posts = await wpFetch<WPPost[]>("/posts", query);
  return posts?.[0] ?? null;
}

export async function getCategories(lang?: string): Promise<WPCategory[]> {
  const query: Record<string, string | number> = {};
  if (lang) query.lang = lang;
  return (await wpFetch<WPCategory[]>("/categories", query)) ?? [];
}

export async function getPostsByCategory(categoryId: number, lang?: string): Promise<WPPost[]> {
  return getPosts({ category: categoryId, lang });
}

export async function getRelatedPosts(ids: number[]): Promise<WPPost[]> {
  if (ids.length === 0) return [];
  return (await wpFetch<WPPost[]>("/posts", { include: ids.join(",") })) ?? [];
}

export async function searchPosts(query: string, lang?: string): Promise<WPPost[]> {
  const params: Record<string, string | number> = { search: query };
  if (lang) params.lang = lang;
  return (await wpFetch<WPPost[]>("/posts", params)) ?? [];
}
