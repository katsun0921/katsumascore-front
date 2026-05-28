/**
 * VOD 一覧専用カスタムエンドポイント `/wp-json/v1/vod-list` のクライアント。
 * フィルタ・ソート・ページネーションをサーバー側で完結させる。
 * 仕様: katsumascore_wordpress_theme/docs/feature/VOD_LIST_API_SPEC.md
 */
import {
  wpRestBaseUrl,
  defaultFetchOptions,
  sleep,
  shouldRetryStatus,
} from '../client';
import type { WpFetchOptions } from '../client';
import { isWpMockMode } from '@/libs/wpMockMode';

/** エンドポイント URL（`wpRestBaseUrl` が未定義のとき `undefined`）。 */
const VOD_LIST_URL = wpRestBaseUrl ? `${wpRestBaseUrl}/v1/vod-list` : undefined;

// ────────────────────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────────────────────

export type VodListTerm = {
  id: number;
  slug: string;
  name: string;
};

export type VodListFeaturedImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

export type VodListItem = {
  id: number;
  slug: string;
  lang: 'ja' | 'en';
  title: string;
  excerpt: string;
  date: string;
  modified: string;
  featuredImage: VodListFeaturedImage | null;
  score: number | null;
  vods: VodListTerm[];
  genres: VodListTerm[];
  tags: VodListTerm[];
};

export type VodListMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type VodListResponse = {
  items: VodListItem[];
  meta: VodListMeta;
};

export type VodListFilter = 'new' | 'score' | 'streaming';

export type VodListParams = {
  /** VOD タームスラッグ（例: `netflix`, `amazon-prime-video`）。必須。 */
  vod: string;
  lang?: 'ja' | 'en';
  page?: number;
  /** 1 ページあたりの件数（デフォルト 20、最大 100）。 */
  per_page?: number;
  /** ソート種別（デフォルト `new`）。 */
  filter?: VodListFilter;
  /** ジャンルスラッグ（複数指定はカンマ区切り）。 */
  genre?: string;
  /** タグスラッグ（複数指定はカンマ区切り）。 */
  tag?: string;
};

// ────────────────────────────────────────────────────────────
// 内部ヘルパー
// ────────────────────────────────────────────────────────────

/** `VodListParams` を `URLSearchParams` に変換する。 */
const buildSearchParams = (params: VodListParams): URLSearchParams => {
  const sp = new URLSearchParams();
  sp.set('vod', params.vod);
  if (params.lang) sp.set('lang', params.lang);
  if (params.page !== undefined) sp.set('page', String(params.page));
  if (params.per_page !== undefined) sp.set('per_page', String(params.per_page));
  if (params.filter) sp.set('filter', params.filter);
  if (params.genre) sp.set('genre', params.genre);
  if (params.tag) sp.set('tag', params.tag);
  return sp;
};

const parseFeaturedImage = (raw: unknown): VodListFeaturedImage | null => {
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

const parseTerm = (raw: unknown): VodListTerm | null => {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== 'number' || typeof o.slug !== 'string' || typeof o.name !== 'string') return null;
  return { id: o.id, slug: o.slug, name: o.name };
};

const parseTermArray = (raw: unknown): VodListTerm[] => {
  if (!Array.isArray(raw)) return [];
  const out: VodListTerm[] = [];
  for (const item of raw) {
    const t = parseTerm(item);
    if (t) out.push(t);
  }
  return out;
};

const parseItem = (raw: unknown): VodListItem | null => {
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
    vods: parseTermArray(o.vods),
    genres: parseTermArray(o.genres),
    tags: parseTermArray(o.tags),
  };
};

const parseVodListResponse = (raw: unknown): VodListResponse | null => {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const items: VodListItem[] = [];
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

// ────────────────────────────────────────────────────────────
// 公開 API
// ────────────────────────────────────────────────────────────

/**
 * VOD 一覧専用カスタムエンドポイントから記事一覧とページネーションメタを取得する。
 * `vod` スラッグは必須。エンドポイント未実装・失敗時は `null`。
 * - 400 / 404 はサーバー側エラーとして `null` を返す
 * - 空ページ（`items: []`）は有効なレスポンスとして返す（フロントで 404 判定）
 */
export const getVodList = async (
  params: VodListParams,
  options?: WpFetchOptions,
): Promise<VodListResponse | null> => {
  if (isWpMockMode()) {
    return { items: [], meta: { page: params.page ?? 1, perPage: params.per_page ?? 20, total: 0, totalPages: 1 } };
  }
  if (!VOD_LIST_URL) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  const url = `${VOD_LIST_URL}?${buildSearchParams(params).toString()}`;
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
      return parseVodListResponse(json);
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};
