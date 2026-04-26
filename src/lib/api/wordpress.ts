import type { WPPost, WPCategory, WPTag, WPPage } from "@/types/wordpress";
export { stripHtml, mapWPPostToPost, parseWPPostUnknown } from "@/lib/api/wordpress.transform";

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

const shuffle = <T>(items: T[]): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
};

export type WpPostsListMeta = {
  total: number;
  totalPages: number;
};

export type WpPostsPagedResult = {
  posts: WPPost[];
  meta: WpPostsListMeta;
};

const wpFetchPostsWithMeta = async (
  query: Record<string, string | number>,
  options?: WpFetchOptions,
): Promise<WpPostsPagedResult | null> => {
  if (!BASE_URL) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = {
    ...defaultWpFetchOptions,
    ...options,
  };
  const url = new URL(`${BASE_URL}/posts`);
  url.searchParams.set("_embed", "1");
  url.searchParams.set("acf_format", "standard");
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, String(value));
  }
  const urlString = url.toString();

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
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
      const total = Number.parseInt(res.headers.get("X-WP-Total") ?? "0", 10) || 0;
      const totalPages = Number.parseInt(res.headers.get("X-WP-TotalPages") ?? "1", 10) || 1;
      const posts = (await res.json()) as WPPost[];
      return { posts, meta: { total, totalPages } };
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
    tags?: number;
  } = {},
): Promise<WPPost[]> => {
  const query: Record<string, string | number> = {};
  if (params.page) query.page = params.page;
  if (params.per_page) query.per_page = params.per_page;
  if (params.lang) query.lang = params.lang;
  if (params.category) query.categories = params.category;
  if (params.tags) query.tags = params.tags;
  return (await wpFetch<WPPost[]>("/posts", query)) ?? [];
};

/** 一覧用: 件数ヘッダ付きで投稿を取得 */
export const getPostsWithMeta = async (params: {
  page?: number;
  per_page?: number;
  lang?: string;
  category?: number;
  tags?: number;
}): Promise<WpPostsPagedResult | null> => {
  const query: Record<string, string | number> = {};
  if (params.page) query.page = params.page;
  if (params.per_page) query.per_page = params.per_page;
  if (params.lang) query.lang = params.lang;
  if (params.category) query.categories = params.category;
  if (params.tags) query.tags = params.tags;
  return wpFetchPostsWithMeta(query);
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

/** タグをシャッフルして先頭 N 件（ホーム「こちらもおすすめ」用） */
export const pickRandomTags = async (count: number, lang?: string): Promise<WPTag[]> => {
  const tags = await getTags(lang);
  return shuffle(tags).slice(0, Math.max(0, count));
};

export const getPostsByTagId = async (
  tagId: number,
  opts: { per_page?: number; page?: number; lang?: string } = {},
): Promise<WPPost[]> =>
  getPosts({
    tags: tagId,
    per_page: opts.per_page ?? 10,
    page: opts.page,
    lang: opts.lang,
  });

export const getCategoryBySlug = async (slug: string, lang?: string): Promise<WPCategory | null> => {
  const categories = await getCategories(lang);
  return categories.find((c) => c.slug === slug) ?? null;
};

/** 親固定ページ配下の子ページ（季節レビュー一覧等） */
export const getChildPages = async (parentId: number, lang?: string): Promise<WPPage[]> => {
  const q: Record<string, string | number> = { parent: parentId, per_page: 100, orderby: "menu_order", order: "asc" };
  if (lang) q.lang = lang;
  return (await wpFetch<WPPage[]>("/pages", q)) ?? [];
};

export const getPageBySlug = async (slug: string, lang?: string): Promise<WPPage | null> => {
  const q: Record<string, string | number> = { slug };
  if (lang) q.lang = lang;
  const pages = await wpFetch<WPPage[]>("/pages", q);
  return pages?.[0] ?? null;
};
