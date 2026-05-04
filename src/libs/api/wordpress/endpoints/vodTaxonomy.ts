/**
 * カスタムタクソノミー `vod` のターム取得（一覧ページの `vod` クエリ用 ID 解決）。
 */
import { WP_VOD_REST_PATH } from "@/config/wpContent.config";
import {
  wpApiBaseUrl,
  defaultFetchOptions,
  sleep,
  shouldRetryStatus,
} from "../client";
import type { WpFetchOptions } from "../client";
import { isWpMockMode } from "@/libs/wpMockMode";
import { mockWpGetVodTermBySlug, mockWpGetVodTerms } from "@/mocks/wp/mockWpQueries";

/** `wpContent.config` の REST コレクション名（スラッグ形式に正規化）。 */
const vodRestCollectionPath = (): string => {
  const raw = WP_VOD_REST_PATH.trim();
  if (raw && /^[a-z0-9-]+$/i.test(raw)) return raw.replace(/^\/+|\/+$/g, "");
  return "vod";
};

export type WPVodTerm = {
  id: number;
  slug: string;
  name: string;
  count: number;
};

/** WP / プラグインにより数値が文字列で返る場合を吸収し、有限整数にする。 */
const coerceFiniteInt = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && /^\d+$/.test(v.trim())) return Number.parseInt(v.trim(), 10);
  return null;
};

/** REST の `name` が文字列または `{ rendered }` のとき表示名を取り出す。 */
const termNameString = (raw: unknown): string | null => {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "rendered" in raw) {
    const r = (raw as { rendered: unknown }).rendered;
    if (typeof r === "string") return r;
  }
  return null;
};

const toWPVodTermLenient = (item: unknown, requestedSlug?: string): WPVodTerm | null => {
  if (typeof item !== "object" || item === null) return null;
  const o = item as Record<string, unknown>;
  const id = coerceFiniteInt(o.id);
  if (id === null) return null;
  let slugVal: string;
  if (typeof o.slug === "string" && o.slug.trim()) {
    slugVal = o.slug.trim();
  } else if (requestedSlug !== undefined && requestedSlug.trim()) {
    slugVal = requestedSlug.trim();
  } else {
    return null;
  }
  const nameVal = termNameString(o.name) ?? slugVal;
  const countRaw = coerceFiniteInt(o.count);
  const count = countRaw !== null ? countRaw : 0;
  return { id, slug: slugVal, name: nameVal, count };
};

const parseVodList = (data: unknown): WPVodTerm[] => {
  if (!Array.isArray(data)) return [];
  const out: WPVodTerm[] = [];
  for (const item of data) {
    const t = toWPVodTermLenient(item);
    if (t) out.push(t);
  }
  return out;
};

/**
 * `slug` クエリで `vod` タームを 1 件取得する。該当なしは `null`。
 * @param slug — WP ターム slug（例: `amazon-prime-video`）
 * @param lang — REST の `lang` クエリ（任意）
 */
export const getVodTermBySlug = async (
  slug: string,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPVodTerm | null> => {
  const trimmed = slug.trim();
  if (!trimmed) return null;
  if (isWpMockMode()) {
    return mockWpGetVodTermBySlug(trimmed);
  }
  if (!wpApiBaseUrl) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const u = new URL(`${wpApiBaseUrl}/${vodRestCollectionPath()}`);
      u.searchParams.set("slug", trimmed);
      u.searchParams.set("per_page", "1");
      u.searchParams.set("_embed", "1");
      u.searchParams.set("acf_format", "standard");
      if (lang) u.searchParams.set("lang", lang);
      const res = await fetch(u.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const json: unknown = await res.json();
      const list = parseVodList(json);
      if (list.length > 0) return list[0] ?? null;
      if (Array.isArray(json) && json.length > 0) {
        const loose = toWPVodTermLenient(json[0], trimmed);
        if (loose) return loose;
      }
      return null;
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

/**
 * `vod` コレクションの先頭ページ（最大 100 件）。REST が無効・失敗時は `null`。
 * `slug` クエリで取れないタームを、一覧から正規化 slug で突き合わせる用途向け。
 */
export const getVodTerms = async (
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPVodTerm[] | null> => {
  if (isWpMockMode()) {
    return mockWpGetVodTerms(lang);
  }
  if (!wpApiBaseUrl) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const u = new URL(`${wpApiBaseUrl}/${vodRestCollectionPath()}`);
      u.searchParams.set("page", "1");
      u.searchParams.set("per_page", "100");
      u.searchParams.set("_embed", "1");
      u.searchParams.set("acf_format", "standard");
      if (lang) u.searchParams.set("lang", lang);
      const res = await fetch(u.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const json: unknown = await res.json();
      return parseVodList(json);
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};
