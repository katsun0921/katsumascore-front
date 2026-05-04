/**
 * 固定ページ（子ページ・フィーチャー・スラッグ取得）の `/pages` ラッパー。
 */
import type { components } from "../generated/wp-schema";
import { wpClient, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";

type WPPageWithAcf = {
  id: number;
  slug: string;
  title: { rendered: string };
  link?: string;
  parent?: number;
  acf?: {
    display_settings?: {
      is_featured?: boolean;
      feature_priority?: number | string;
      feature_type?: string;
    };
  };
};

const BASE_URL = process.env.WP_API_URL?.replace(/\/+$/, "") ?? "";

/** ACF の `display_settings.is_featured` が真のページのみ返す（生 `fetch`）。 */
export const getFeaturedPages = async (lang?: string): Promise<WPPageWithAcf[]> => {
  if (!BASE_URL) return [];
  const params = new URLSearchParams({ per_page: "100", acf_format: "standard", _fields: "id,slug,title,link,parent,acf" });
  if (lang) params.set("lang", lang);
  try {
    const res = await fetch(`${BASE_URL}/pages?${params.toString()}`);
    if (!res.ok) return [];
    const data: WPPageWithAcf[] = await res.json();
    return data.filter((p) => p.acf?.display_settings?.is_featured === true);
  } catch {
    return [];
  }
};

type WPPage = components["schemas"]["WPPage"];

type PagesQuery = {
  per_page?: number;
  lang?: "ja" | "en";
  parent?: number;
  slug?: string;
  orderby?: "menu_order" | "date" | "title";
  order?: "asc" | "desc";
};

/** `/pages` を OpenAPI クライアント経由で再試行付き取得する。 */
const fetchPages = async (
  query: PagesQuery,
  options?: WpFetchOptions,
): Promise<WPPage[] | null> => {
  if (!wpClient) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const { data, response } = await wpClient.GET("/pages", {
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

/** 指定親ページ ID の子ページをメニュー順で取得する。`ja` 取得が空なら言語指定なしで再取得する。 */
export const getChildPages = async (
  parentId: number,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPPage[]> => {
  const q: PagesQuery = {
    parent: parentId,
    per_page: 100,
    orderby: "menu_order",
    order: "asc",
    ...(lang ? { lang: lang as "ja" | "en" } : {}),
  };
  const pages = (await fetchPages(q, options)) ?? [];
  if (pages.length > 0 || lang !== "ja") return pages;
  const fallbackQuery: PagesQuery = {
    parent: parentId,
    per_page: 100,
    orderby: "menu_order",
    order: "asc",
  };
  return (await fetchPages(fallbackQuery, options)) ?? [];
};

/** スラッグで固定ページ 1 件を取得する。`ja` 取得が空なら言語指定なしで再取得し、それでも無ければ `null`。 */
export const getPageBySlug = async (
  slug: string,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPPage | null> => {
  const q: PagesQuery = { slug, ...(lang ? { lang: lang as "ja" | "en" } : {}) };
  const pages = await fetchPages(q, options);
  const page = pages?.[0] ?? null;
  if (page || lang !== "ja") return page;
  const fallbackPages = await fetchPages({ slug }, options);
  return fallbackPages?.[0] ?? null;
};
