import type { WPPost, WPCategory, WPTag } from "@/types/wordpress";
export { stripHtml, mapWPPostToPost } from "@/lib/api/wordpress.transform";

const BASE_URL = process.env.WP_API_URL;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export type WpFetchOptions = {
  timeoutMs?: number;
  maxRetries?: number;
  initialBackoffMs?: number;
};

const defaultWpFetchOptions: Required<WpFetchOptions> = {
  timeoutMs: 3000,
  maxRetries: 2,
  initialBackoffMs: 500,
};

const shouldRetryStatus = (status: number) => {
  if (status === 429) return true;
  if (status >= 500) return true;
  return false;
};

const wpFetch = async <T>(
  path: string,
  params: Record<string, string | number> = {},
  options?: WpFetchOptions,
): Promise<T | null> => {
  if (!BASE_URL) return null;

  const { timeoutMs, maxRetries, initialBackoffMs } = {
    ...defaultWpFetchOptions,
    ...options,
  };

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("_embed", "1");
  url.searchParams.set("acf_format", "standard");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  const urlString = url.toString();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);
    try {
      const res = await fetch(urlString, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      return (await res.json()) as T;
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

export const getPosts = async (
  params: {
    page?: number;
    per_page?: number;
    lang?: string;
    category?: number;
  } = {},
): Promise<WPPost[]> => {
  const query: Record<string, string | number> = {};
  if (params.page) query.page = params.page;
  if (params.per_page) query.per_page = params.per_page;
  if (params.lang) query.lang = params.lang;
  if (params.category) query.categories = params.category;
  return (await wpFetch<WPPost[]>("/posts", query)) ?? [];
};

export const getPostBySlug = async (slug: string, lang?: string): Promise<WPPost | null> => {
  const query: Record<string, string | number> = { slug };
  if (lang) query.lang = lang;
  const posts = await wpFetch<WPPost[]>("/posts", query);
  return posts?.[0] ?? null;
};

export const getCategories = async (lang?: string): Promise<WPCategory[]> => {
  const query: Record<string, string | number> = {};
  if (lang) query.lang = lang;
  return (await wpFetch<WPCategory[]>("/categories", query)) ?? [];
};

export const getPostsByCategory = async (categoryId: number, lang?: string): Promise<WPPost[]> =>
  getPosts({ category: categoryId, lang });

export const getRelatedPosts = async (ids: number[]): Promise<WPPost[]> => {
  if (ids.length === 0) return [];
  return (await wpFetch<WPPost[]>("/posts", { include: ids.join(",") })) ?? [];
};

export const searchPosts = async (query: string, lang?: string): Promise<WPPost[]> => {
  const params: Record<string, string | number> = { search: query };
  if (lang) params.lang = lang;
  return (await wpFetch<WPPost[]>("/posts", params)) ?? [];
};

export const getTags = async (lang?: string): Promise<WPTag[]> => {
  const params: Record<string, string | number> = { per_page: 100 };
  if (lang) params.lang = lang;
  return (await wpFetch<WPTag[]>("/tags", params)) ?? [];
};
