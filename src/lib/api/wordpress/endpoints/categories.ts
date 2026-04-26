import type { components } from "../generated/wp-schema";
import { wpClient, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";

type WPCategory = components["schemas"]["WPCategory"];

const fetchCategories = async (
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPCategory[] | null> => {
  if (!wpClient) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const { data, response } = await wpClient.GET("/categories", {
        params: { query: lang ? { lang: lang as "ja" | "en" } : {} },
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

export const getCategories = async (
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPCategory[]> => (await fetchCategories(lang, options)) ?? [];

export const getCategoryBySlug = async (
  slug: string,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPCategory | null> => {
  const categories = await getCategories(lang, options);
  return categories.find((c) => c.slug === slug) ?? null;
};
