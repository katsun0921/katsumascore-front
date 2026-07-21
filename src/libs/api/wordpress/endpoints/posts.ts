import type { components } from "../generated/wp-schema";
import {
  wpClient,
  wpApiBaseUrl,
  defaultFetchOptions,
  sleep,
  shouldRetryStatus,
} from "../client";
import type { WpFetchOptions, WpPostsPagedResult } from "../client";
import { isWpMockMode } from "@/libs/wpMockMode";
import { mockWpPostsList, mockWpPostsPaged } from "@/mocks/wp/mockWpQueries";

/** 投稿一覧・検索・関連取得など `/posts` 系エンドポイントのラッパー。 */

type WPPost = components["schemas"]["WPPost"];

/** `video_code` 等のカスタムメタは `meta` を要求しないと REST に含まれない */
const FIELDS =
  "id,slug,link,title,excerpt,content,date,modified,featured_media,acf,meta,_links,_embedded";

type PostsQuery = {
  page?: number;
  per_page?: number;
  categories?: number;
  tags?: number;
  /** カスタム taxonomy `genre` — WP 実装では多くの場合ターム ID（文字列の数値）。slug が効かないときは ID を渡す */
  genre?: string;
  /** カスタム taxonomy `vod` のターム ID（OpenAPI 未定義のためクエリは生 URL で付与） */
  vod?: number;
  /** カスタム taxonomy `franchise` のターム ID（シリーズ特集ページ用） */
  franchise?: number;
  slug?: string;
  search?: string;
  include?: string;
  _fields?: string;
};

type PostsParams = {
  page?: number;
  per_page?: number;
  category?: number;
  tags?: number;
  genre?: string;
  vod?: number;
  franchise?: number;
};

/** 呼び出し側の `category` / `tags` 等を WP REST の `categories` / `tags` クエリに写す。 */
const buildPostsQuery = (params: PostsParams): PostsQuery => {
  const q: PostsQuery = { _fields: FIELDS };
  if (params.page) q.page = params.page;
  if (params.per_page) q.per_page = params.per_page;
  if (params.category) q.categories = params.category;
  if (params.tags) q.tags = params.tags;
  if (params.genre) q.genre = params.genre;
  if (params.vod !== undefined) q.vod = params.vod;
  if (params.franchise !== undefined) q.franchise = params.franchise;
  return q;
};

/** 生 `fetch` 用に `PostsQuery` を `URLSearchParams` へ直列化する（genre / vod 等 OpenAPI 外クエリ向け）。 */
const postsQueryToSearchParams = (q: PostsQuery): URLSearchParams => {
  const sp = new URLSearchParams();
  sp.set("_embed", "1");
  sp.set("acf_format", "standard");
  sp.set("_fields", q._fields ?? FIELDS);
  if (q.page !== undefined) sp.set("page", String(q.page));
  if (q.per_page !== undefined) sp.set("per_page", String(q.per_page));
  if (q.categories !== undefined) sp.set("categories", String(q.categories));
  if (q.tags !== undefined) sp.set("tags", String(q.tags));
  if (q.genre) sp.set("genre", q.genre);
  if (q.vod !== undefined) sp.set("vod", String(q.vod));
  if (q.franchise !== undefined) sp.set("franchise", String(q.franchise));
  if (q.slug) sp.set("slug", q.slug);
  if (q.search) sp.set("search", q.search);
  if (q.include) sp.set("include", q.include);
  return sp;
};

/** OpenAPI 未対応クエリを含むときに HTTP で取得し、`X-WP-Total` 系ヘッダからメタを返す。 */
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

/** 投稿配列のみが欲しい場合。`genre` / `vod` / `franchise` 指定時は常に HTTP 経由。 */
const fetchPosts = async (
  query: PostsQuery,
  options?: WpFetchOptions,
): Promise<WPPost[] | null> => {
  if (isWpMockMode()) {
    return mockWpPostsList(query);
  }
  if (query.genre || query.vod !== undefined || query.franchise !== undefined) {
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

/** ページネーション用にアイテムと総件数・総ページ数を返す。 */
const fetchPostsWithMeta = async (
  query: PostsQuery,
  options?: WpFetchOptions,
): Promise<WpPostsPagedResult<WPPost> | null> => {
  if (isWpMockMode()) {
    return mockWpPostsPaged(query);
  }
  if (query.genre || query.vod !== undefined || query.franchise !== undefined) return fetchPostsWithMetaOverHttp(query, options);
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

/** 条件に合う投稿一覧。失敗時は空配列。 */
export const getPosts = async (
  params: PostsParams = {},
  options?: WpFetchOptions,
): Promise<WPPost[]> => (await fetchPosts(buildPostsQuery(params), options)) ?? [];

/** 一覧と `X-WP-Total` / `X-WP-TotalPages` 相当のメタ。失敗時は `null`。 */
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

  // 1ページ目を取得して totalPages を確定する
  const first = await getPostsWithMeta({ ...base, page: 1, per_page: perPage }, options);
  if (!first || first.items.length === 0) return [];

  const totalPages = Math.min(first.meta.totalPages, maxPages);
  const results: WPPost[] = [...first.items];

  // 残りのページを並列取得する
  if (totalPages > 1) {
    const remaining = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
    const batches = await Promise.all(
      remaining.map((page) => getPostsWithMeta({ ...base, page, per_page: perPage }, options)),
    );
    for (const batch of batches) {
      if (batch) results.push(...batch.items);
    }
  }

  // 重複除去
  const seenIds = new Set<number>();
  return results.filter((p) => {
    if (seenIds.has(p.id)) return false;
    seenIds.add(p.id);
    return true;
  });
};

/** スラッグで 1 件取得。該当なしは `null`。 */
export const getPostBySlug = async (
  slug: string,
  options?: WpFetchOptions,
): Promise<WPPost | null> => {
  const posts = await fetchPosts({ slug, _fields: FIELDS }, options);
  return posts?.[0] ?? null;
};

/** 投稿 ID 配列で一括取得（順序は WP 依存）。 */
export const getRelatedPosts = async (
  ids: number[],
  options?: WpFetchOptions,
): Promise<WPPost[]> => {
  if (ids.length === 0) return [];
  return (await fetchPosts({ include: ids.join(","), per_page: Math.min(ids.length, 100), _fields: FIELDS }, options)) ?? [];
};

/** `search` クエリによる全文検索結果。 */
export const searchPosts = async (
  query: string,
  options?: WpFetchOptions,
): Promise<WPPost[]> => (await fetchPosts({ search: query, _fields: FIELDS }, options)) ?? [];

/** カテゴリ ID で絞った投稿一覧。 */
export const getPostsByCategory = async (
  categoryId: number,
  options?: WpFetchOptions,
): Promise<WPPost[]> => getPosts({ category: categoryId }, options);

/** タグ ID で絞った投稿一覧（件数・ページは `opts` で指定）。 */
export const getPostsByTagId = async (
  tagId: number,
  opts: { per_page?: number; page?: number } = {},
  options?: WpFetchOptions,
): Promise<WPPost[]> =>
  getPosts(
    { tags: tagId, per_page: opts.per_page ?? 10, page: opts.page },
    options,
  );

/** franchise タクソノミーのターム ID で絞った投稿一覧（シリーズ特集ページ用）。 */
export const getPostsByFranchiseTermId = async (
  termId: number,
  perPage = 100,
  options?: WpFetchOptions,
): Promise<WPPost[]> => getPosts({ franchise: termId, per_page: perPage }, options);
