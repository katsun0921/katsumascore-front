import type { components } from "../generated/wp-schema";
import {
  wpClient,
  wpApiBaseUrl,
  defaultFetchOptions,
  sleep,
  shouldRetryStatus,
} from "../client";
import type { WpFetchOptions, WpPostsPagedResult } from "../client";

type WPPost = components["schemas"]["WPPost"];

/** `video_code` 等のカスタムメタは `meta` を要求しないと REST に含まれない */
const FIELDS =
  "id,slug,link,title,excerpt,content,date,modified,featured_media,acf,meta,_links,_embedded";

type PostsQuery = {
  page?: number;
  per_page?: number;
  lang?: "ja" | "en";
  categories?: number;
  tags?: number;
  /** カスタム taxonomy `genre` のスラッグ（OpenAPI 未定義のためクエリは生 URL で付与） */
  genre?: string;
  /** カスタム taxonomy `vod` のターム ID（OpenAPI 未定義のためクエリは生 URL で付与） */
  vod?: number;
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
  genre?: string;
  vod?: number;
};

const buildPostsQuery = (params: PostsParams): PostsQuery => {
  const q: PostsQuery = { _fields: FIELDS };
  if (params.page) q.page = params.page;
  if (params.per_page) q.per_page = params.per_page;
  if (params.lang) q.lang = params.lang as "ja" | "en";
  if (params.category) q.categories = params.category;
  if (params.tags) q.tags = params.tags;
  if (params.genre) q.genre = params.genre;
  if (params.vod !== undefined) q.vod = params.vod;
  return q;
};

const postsQueryToSearchParams = (q: PostsQuery): URLSearchParams => {
  const sp = new URLSearchParams();
  sp.set("_embed", "1");
  sp.set("acf_format", "standard");
  sp.set("_fields", q._fields ?? FIELDS);
  if (q.page !== undefined) sp.set("page", String(q.page));
  if (q.per_page !== undefined) sp.set("per_page", String(q.per_page));
  if (q.lang) sp.set("lang", q.lang);
  if (q.categories !== undefined) sp.set("categories", String(q.categories));
  if (q.tags !== undefined) sp.set("tags", String(q.tags));
  if (q.genre) sp.set("genre", q.genre);
  if (q.vod !== undefined) sp.set("vod", String(q.vod));
  if (q.slug) sp.set("slug", q.slug);
  if (q.search) sp.set("search", q.search);
  if (q.include) sp.set("include", q.include);
  return sp;
};

const fetchPostsWithMetaOverHttp = async (
  query: PostsQuery,
  options?: WpFetchOptions,
): Promise<WpPostsPagedResult<WPPost> | null> => {
  if (!wpApiBaseUrl) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  const url = `${wpApiBaseUrl}/posts?${postsQueryToSearchParams(query).toString()}`;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) {
        if (!shouldRetryStatus(response.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const data: unknown = await response.json();
      const items = Array.isArray(data) ? (data as WPPost[]) : [];
      const total = Number.parseInt(response.headers.get("X-WP-Total") ?? "0", 10) || 0;
      const totalPages = Number.parseInt(response.headers.get("X-WP-TotalPages") ?? "1", 10) || 1;
      return { items, meta: { total, totalPages } };
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

const fetchPosts = async (
  query: PostsQuery,
  options?: WpFetchOptions,
): Promise<WPPost[] | null> => {
  if (query.genre || query.vod !== undefined) {
    const paged = await fetchPostsWithMetaOverHttp(query, options);
    return paged?.items ?? null;
  }
  if (!wpClient) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  const { genre: _g, vod: _vod, ...openapiQuery } = query;
  void _g;
  void _vod;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const { data, response } = await wpClient.GET("/posts", {
        params: { query: openapiQuery },
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
  if (query.genre || query.vod !== undefined) return fetchPostsWithMetaOverHttp(query, options);
  if (!wpClient) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const { genre: _g2, vod: _vod2, ...openapiQueryPaged } = query;
      void _g2;
      void _vod2;
      const { data, response } = await wpClient.GET("/posts", {
        params: { query: openapiQueryPaged },
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

/**
 * 投稿一覧を複数 REST ページにわたって取得し、ID 重複を除いて結合する。
 * 直近1ページ（既定100件）だけでは高スコア記事の候補が足りない場合に使う。
 */
export const getPostsPagedMerge = async (
  base: PostsParams,
  maxPages: number,
  options?: WpFetchOptions,
): Promise<WPPost[]> => {
  if (maxPages < 1) return [];
  const perPage = base.per_page ?? 100;
  const merged: WPPost[] = [];
  const seenIds = new Set<number>();
  let totalPages = 1;

  for (let page = 1; page <= maxPages; page += 1) {
    const batch = await getPostsWithMeta({ ...base, page, per_page: perPage }, options);
    if (!batch || batch.items.length === 0) break;
    totalPages = batch.meta.totalPages;
    for (const p of batch.items) {
      if (seenIds.has(p.id)) continue;
      seenIds.add(p.id);
      merged.push(p);
    }
    if (page >= totalPages) break;
  }
  return merged;
};

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
  return (await fetchPosts({ include: ids.join(","), per_page: Math.min(ids.length, 100), _fields: FIELDS }, options)) ?? [];
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
