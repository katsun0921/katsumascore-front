/**
 * Person 出演/監督作品一覧専用カスタムエンドポイント `/wp-json/v1/posts-by-person` のクライアント。
 * Person CPT の post_object 参照（director / actors_filed.actor）から記事を逆引きする。
 */
import {
  wpRestBaseUrl,
  defaultFetchOptions,
  sleep,
  shouldRetryStatus,
} from '../client';
import type { WpFetchOptions } from '../client';
import { isWpMockMode } from '@/libs/wpMockMode';
import { getPostUrl, resolvePostType } from '@/libs/route';
import type { Post } from '@/types/post';

const POSTS_BY_PERSON_URL = wpRestBaseUrl ? `${wpRestBaseUrl}/v1/posts-by-person` : undefined;

type PersonRelatedPostsFeaturedImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

type PersonRelatedPostsItem = {
  id: number;
  slug: string;
  lang: 'ja' | 'en';
  title: string;
  excerpt: string;
  date: string;
  modified: string;
  featuredImage: PersonRelatedPostsFeaturedImage | null;
  score: number | null;
  categorySlug: string | null;
};

export type PersonRelatedPostsParams = {
  personId: number;
  lang?: 'ja' | 'en';
  page?: number;
  per_page?: number;
};

const buildSearchParams = (params: PersonRelatedPostsParams): URLSearchParams => {
  const sp = new URLSearchParams();
  sp.set('person_id', String(params.personId));
  if (params.lang) sp.set('lang', params.lang);
  if (params.page !== undefined) sp.set('page', String(params.page));
  if (params.per_page !== undefined) sp.set('per_page', String(params.per_page));
  return sp;
};

const parseFeaturedImage = (raw: unknown): PersonRelatedPostsFeaturedImage | null => {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.url !== 'string') return null;
  return {
    url: o.url,
    width: typeof o.width === 'number' ? o.width : 0,
    height: typeof o.height === 'number' ? o.height : 0,
    alt: typeof o.alt === 'string' ? o.alt : '',
  };
};

const parseItem = (raw: unknown): PersonRelatedPostsItem | null => {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== 'number' || typeof o.slug !== 'string') return null;
  return {
    id: o.id,
    slug: o.slug,
    lang: o.lang === 'en' ? 'en' : 'ja',
    title: typeof o.title === 'string' ? o.title : '',
    excerpt: typeof o.excerpt === 'string' ? o.excerpt : '',
    date: typeof o.date === 'string' ? o.date : '',
    modified: typeof o.modified === 'string' ? o.modified : '',
    featuredImage: parseFeaturedImage(o.featuredImage),
    score: typeof o.score === 'number' ? o.score : null,
    categorySlug: typeof o.categorySlug === 'string' ? o.categorySlug : null,
  };
};

const parseItems = (raw: unknown): PersonRelatedPostsItem[] => {
  if (!raw || typeof raw !== 'object') return [];
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.items)) return [];
  const out: PersonRelatedPostsItem[] = [];
  for (const item of o.items) {
    const parsed = parseItem(item);
    if (parsed) out.push(parsed);
  }
  return out;
};

/** カスタムエンドポイントのアイテムをアプリの `Post` へ変換する。 */
const mapItemToPost = (item: PersonRelatedPostsItem): Post => {
  const type = resolvePostType(item.categorySlug ?? undefined);
  return {
    id: String(item.id),
    slug: getPostUrl(type, item.slug, item.lang),
    title: item.title,
    excerpt: item.excerpt,
    image: item.featuredImage?.url ?? null,
    publishedAt: item.date.slice(0, 10),
    lang: item.lang,
    type,
    ...(item.score !== null ? { score: item.score } : {}),
  };
};

/**
 * Person が出演/監督した記事一覧を取得する。`personId` は person CPT の投稿 ID。
 * エンドポイント未実装・失敗時は空配列。
 */
export const getPostsByPersonId = async (
  personId: number,
  params: Omit<PersonRelatedPostsParams, 'personId'> = {},
  options?: WpFetchOptions,
): Promise<Post[]> => {
  if (isWpMockMode()) return [];
  if (!POSTS_BY_PERSON_URL) return [];
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  const url = `${POSTS_BY_PERSON_URL}?${buildSearchParams({ personId, ...params }).toString()}`;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return [];
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const json: unknown = await res.json();
      return parseItems(json).map(mapItemToPost);
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return [];
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return [];
};
