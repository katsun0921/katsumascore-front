import type { components } from "../generated/wp-schema";
import { wpClient, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";

type WPTag = components["schemas"]["WPTag"];

const shuffle = <T>(items: T[]): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
};

const fetchTags = async (lang?: string, options?: WpFetchOptions): Promise<WPTag[] | null> => {
  if (!wpClient) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const { data, response } = await wpClient.GET("/tags", {
        params: { query: { per_page: 100, ...(lang ? { lang: lang as "ja" | "en" } : {}) } },
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

export const getTags = async (lang?: string, options?: WpFetchOptions): Promise<WPTag[]> =>
  (await fetchTags(lang, options)) ?? [];

export const pickRandomTags = async (
  count: number,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPTag[]> => {
  const tags = await getTags(lang, options);
  return shuffle(tags).slice(0, Math.max(0, count));
};
