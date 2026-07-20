/**
 * Person 出演/監督作品一覧専用カスタムエンドポイント `/wp-json/v1/posts-by-person` のクライアント。
 * 記事の出演者・監督は ACF post_object（`director` / `actors_filed.actor`）で person CPT に
 * 直接リンクされており taxonomy ではないため、person の投稿 ID で逆引きする。
 */
import {
  wpRestBaseUrl,
  defaultFetchOptions,
  sleep,
  shouldRetryStatus,
} from '../client';
import type { WpFetchOptions } from '../client';
import { isWpMockMode } from '@/libs/wpMockMode';

const POSTS_BY_PERSON_URL = wpRestBaseUrl ? `${wpRestBaseUrl}/v1/posts-by-person` : undefined;

export type PersonRelatedPostFeaturedImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

export type PersonRelatedPostItem = {
  id: number;
  slug: string;
  lang: 'ja' | 'en';
  title: string;
  excerpt: string;
  date: string;
  modified: string;
  featuredImage: PersonRelatedPostFeaturedImage | null;
  score: number | null;
  categorySlug: string | null;
  /** 対象 person が出演者として一致した行の役名。監督のみでの一致時は null。 */
  character: string | null;
};

export type PersonRelatedPostsMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type PersonRelatedPostsResponse = {
  items: PersonRelatedPostItem[];
  meta: PersonRelatedPostsMeta;
};

export type PersonRelatedPostsParams = {
  personId: number;
  lang?: 'ja' | 'en';
  page?: number;
  perPage?: number;
};

const buildSearchParams = (params: PersonRelatedPostsParams): URLSearchParams => {
  const sp = new URLSearchParams();
  sp.set('person_id', String(params.personId));
  if (params.lang) sp.set('lang', params.lang);
  if (params.page !== undefined) sp.set('page', String(params.page));
  if (params.perPage !== undefined) sp.set('per_page', String(params.perPage));
  return sp;
};

const parseFeaturedImage = (raw: unknown): PersonRelatedPostFeaturedImage | null => {
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

const parseItem = (raw: unknown): PersonRelatedPostItem | null => {
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
    character: typeof o.character === 'string' ? o.character : null,
  };
};

const parseResponse = (raw: unknown): PersonRelatedPostsResponse | null => {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const items: PersonRelatedPostItem[] = [];
  if (Array.isArray(o.items)) {
    for (const item of o.items) {
      const parsed = parseItem(item);
      if (parsed) items.push(parsed);
    }
  }
  const m = o.meta;
  if (!m || typeof m !== 'object') return null;
  const meta = m as Record<string, unknown>;
  return {
    items,
    meta: {
      page: typeof meta.page === 'number' ? meta.page : 1,
      perPage: typeof meta.perPage === 'number' ? meta.perPage : 20,
      total: typeof meta.total === 'number' ? meta.total : items.length,
      totalPages: typeof meta.totalPages === 'number' ? meta.totalPages : 1,
    },
  };
};

/**
 * person の投稿 ID（`director` / `actors_filed.actor` が参照する person CPT の ID）から、
 * その person が出演・監督している記事一覧を取得する。エンドポイント未実装・失敗時は `null`。
 */
export const getPostsByPersonId = async (
  params: PersonRelatedPostsParams,
  options?: WpFetchOptions,
): Promise<PersonRelatedPostsResponse | null> => {
  if (isWpMockMode()) {
    return { items: [], meta: { page: params.page ?? 1, perPage: params.perPage ?? 20, total: 0, totalPages: 1 } };
  }
  if (!POSTS_BY_PERSON_URL) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  const url = `${POSTS_BY_PERSON_URL}?${buildSearchParams(params).toString()}`;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const json: unknown = await res.json();
      return parseResponse(json);
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};
