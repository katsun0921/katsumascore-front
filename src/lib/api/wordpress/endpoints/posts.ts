import type { components } from "../generated/wp-schema";
import {
  wpClient,
  defaultFetchOptions,
  sleep,
  shouldRetryStatus,
} from "../client";
import type { WpFetchOptions, WpPostsPagedResult } from "../client";

type WPPost = components["schemas"]["WPPost"];

const FIELDS =
  "id,slug,link,title,excerpt,content,date,modified,featured_media,acf,_links,_embedded";

type PostsQuery = {
  page?: number;
  per_page?: number;
  lang?: "ja" | "en";
  categories?: number;
  tags?: number;
  slug?: string;
  search?: string;
  include?: string;
  _fields?: string;
};

type PostsParams = {
  page?: number;
  per_page?: number;
  lang?: string;
  category?: number;
  tags?: number;
};

const buildPostsQuery = (params: PostsParams): PostsQuery => {
  const q: PostsQuery = { _fields: FIELDS };
  if (params.page) q.page = params.page;
  if (params.per_page) q.per_page = params.per_page;
  if (params.lang) q.lang = params.lang as "ja" | "en";
  if (params.category) q.categories = params.category;
  if (params.tags) q.tags = params.tags;
  return q;
};

const fetchPosts = async (
  query: PostsQuery,
  options?: WpFetchOptions,
): Promise<WPPost[] | null> => {
  if (!wpClient) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const { data, response } = await wpClient.GET("/posts", {
        params: { query },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        if (!shouldRetryStatus(response.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      return data ?? null;
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

const fetchPostsWithMeta = async (
  query: PostsQuery,
  options?: WpFetchOptions,
): Promise<WpPostsPagedResult<WPPost> | null> => {
  if (!wpClient) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const { data, response } = await wpClient.GET("/posts", {
        params: { query },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        if (!shouldRetryStatus(response.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const total = Number.parseInt(response.headers.get("X-WP-Total") ?? "0", 10) || 0;
      const totalPages = Number.parseInt(response.headers.get("X-WP-TotalPages") ?? "1", 10) || 1;
      return { items: data ?? [], meta: { total, totalPages } };
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

export const getPosts = async (
  params: PostsParams = {},
  options?: WpFetchOptions,
): Promise<WPPost[]> => (await fetchPosts(buildPostsQuery(params), options)) ?? [];

export const getPostsWithMeta = async (
  params: PostsParams,
  options?: WpFetchOptions,
): Promise<WpPostsPagedResult<WPPost> | null> =>
  fetchPostsWithMeta(buildPostsQuery(params), options);

export const getPostBySlug = async (
  slug: string,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPPost | null> => {
  const q: PostsQuery = { slug, _fields: FIELDS };
  if (lang) q.lang = lang as "ja" | "en";
  const posts = await fetchPosts(q, options);
  return posts?.[0] ?? null;
};

export const getRelatedPosts = async (
  ids: number[],
  options?: WpFetchOptions,
): Promise<WPPost[]> => {
  if (ids.length === 0) return [];
  return (await fetchPosts({ include: ids.join(","), _fields: FIELDS }, options)) ?? [];
};

export const searchPosts = async (
  query: string,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPPost[]> => {
  const q: PostsQuery = { search: query, _fields: FIELDS };
  if (lang) q.lang = lang as "ja" | "en";
  return (await fetchPosts(q, options)) ?? [];
};

export const getPostsByCategory = async (
  categoryId: number,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPPost[]> => getPosts({ category: categoryId, lang }, options);

export const getPostsByTagId = async (
  tagId: number,
  opts: { per_page?: number; page?: number; lang?: string } = {},
  options?: WpFetchOptions,
): Promise<WPPost[]> =>
  getPosts(
    { tags: tagId, per_page: opts.per_page ?? 10, page: opts.page, lang: opts.lang },
    options,
  );
