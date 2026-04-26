import type { components } from "../generated/wp-schema";
import { wpClient, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";

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
