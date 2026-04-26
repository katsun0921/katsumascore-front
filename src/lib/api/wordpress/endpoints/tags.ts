import type { WPTag } from "@/types/wordpress";
import { wpFetch } from "../client";
import type { WpFetchOptions } from "../client";

const shuffle = <T>(items: T[]): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
};

export const getTags = async (lang?: string, options?: WpFetchOptions): Promise<WPTag[]> => {
  const q: Record<string, string | number> = { per_page: 100 };
  if (lang) q.lang = lang;
  return (await wpFetch<WPTag[]>("/tags", q, options)) ?? [];
};

export const pickRandomTags = async (
  count: number,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPTag[]> => {
  const tags = await getTags(lang, options);
  return shuffle(tags).slice(0, Math.max(0, count));
};
