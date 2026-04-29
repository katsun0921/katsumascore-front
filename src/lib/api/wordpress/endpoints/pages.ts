import type { components } from "../generated/wp-schema";
import { wpClient, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";

type WPPageWithAcf = {
  id: number;
  slug: string;
  title: { rendered: string };
  link?: string;
  acf?: {
    display_settings?: {
      is_featured?: boolean;
      feature_priority?: number | string;
      feature_type?: string;
    };
  };
};

const BASE_URL = process.env.WP_API_URL?.replace(/\/+$/, "") ?? "";

export const getFeaturedPages = async (lang?: string): Promise<WPPageWithAcf[]> => {
  if (!BASE_URL) return [];
  const params = new URLSearchParams({ per_page: "100", acf_format: "standard", _fields: "id,slug,title,link,acf" });
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
  return (await fetchPages(q, options)) ?? [];
};

export const getPageBySlug = async (
  slug: string,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPPage | null> => {
  const q: PagesQuery = { slug, ...(lang ? { lang: lang as "ja" | "en" } : {}) };
  const pages = await fetchPages(q, options);
  return pages?.[0] ?? null;
};
