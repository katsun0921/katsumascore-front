import type { WPCategory } from "@/types/wordpress";
import { wpFetch } from "../client";
import type { WpFetchOptions } from "../client";

export const getCategories = async (
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPCategory[]> => {
  const q: Record<string, string | number> = {};
  if (lang) q.lang = lang;
  return (await wpFetch<WPCategory[]>("/categories", q, options)) ?? [];
};

export const getCategoryBySlug = async (
  slug: string,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPCategory | null> => {
  const categories = await getCategories(lang, options);
  return categories.find((c) => c.slug === slug) ?? null;
};
