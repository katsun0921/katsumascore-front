import type { WPPost } from "@/types/wordpress";
import { wpFetch, wpFetchWithMeta } from "../client";
import type { WpFetchOptions, WpPostsPagedResult } from "../client";

const FIELDS =
  "id,slug,title,excerpt,content,date,modified,featured_media,acf,_links,_embedded";

type PostsParams = {
  page?: number;
  per_page?: number;
  lang?: string;
  category?: number;
  tags?: number;
};

const buildPostsQuery = (params: PostsParams): Record<string, string | number> => {
  const q: Record<string, string | number> = { _fields: FIELDS };
  if (params.page) q.page = params.page;
  if (params.per_page) q.per_page = params.per_page;
  if (params.lang) q.lang = params.lang;
  if (params.category) q.categories = params.category;
  if (params.tags) q.tags = params.tags;
  return q;
};

export const getPosts = async (
  params: PostsParams = {},
  options?: WpFetchOptions,
): Promise<WPPost[]> =>
  (await wpFetch<WPPost[]>("/posts", buildPostsQuery(params), options)) ?? [];

export const getPostsWithMeta = async (
  params: PostsParams,
  options?: WpFetchOptions,
): Promise<WpPostsPagedResult<WPPost> | null> =>
  wpFetchWithMeta<WPPost>("/posts", buildPostsQuery(params), options);

export const getPostBySlug = async (
  slug: string,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPPost | null> => {
  const q: Record<string, string | number> = { slug, _fields: FIELDS };
  if (lang) q.lang = lang;
  const posts = await wpFetch<WPPost[]>("/posts", q, options);
  return posts?.[0] ?? null;
};

export const getRelatedPosts = async (
  ids: number[],
  options?: WpFetchOptions,
): Promise<WPPost[]> => {
  if (ids.length === 0) return [];
  return (
    (await wpFetch<WPPost[]>("/posts", { include: ids.join(","), _fields: FIELDS }, options)) ?? []
  );
};

export const searchPosts = async (
  query: string,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPPost[]> => {
  const q: Record<string, string | number> = { search: query, _fields: FIELDS };
  if (lang) q.lang = lang;
  return (await wpFetch<WPPost[]>("/posts", q, options)) ?? [];
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
