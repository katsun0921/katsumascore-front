import type { WPPage } from "@/types/wordpress";
import { wpFetch } from "../client";
import type { WpFetchOptions } from "../client";

export const getChildPages = async (
  parentId: number,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPPage[]> => {
  const q: Record<string, string | number> = {
    parent: parentId,
    per_page: 100,
    orderby: "menu_order",
    order: "asc",
  };
  if (lang) q.lang = lang;
  return (await wpFetch<WPPage[]>("/pages", q, options)) ?? [];
};

export const getPageBySlug = async (
  slug: string,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPPage | null> => {
  const q: Record<string, string | number> = { slug };
  if (lang) q.lang = lang;
  const pages = await wpFetch<WPPage[]>("/pages", q, options);
  return pages?.[0] ?? null;
};
