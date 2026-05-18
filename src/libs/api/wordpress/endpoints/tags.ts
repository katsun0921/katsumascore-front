/**
 * `/tags` エンドポイントとランダムタグ抽出。
 */
import type { components } from "../generated/wp-schema";
import { wpClient, wpApiBaseUrl, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";
import { isWpMockMode } from "@/libs/wpMockMode";
import { mockWpGetTags } from "@/mocks/wp/mockWpQueries";

type WPTag = components["schemas"]["WPTag"];

/** Fisher–Yates 風のインプレースシャッフル（コピー返却）。 */
const shuffle = <T>(items: T[]): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
};

/** タグ一覧を再試行付きで取得する。 */
const fetchTags = async (options?: WpFetchOptions): Promise<WPTag[] | null> => {
  if (isWpMockMode()) {
    return mockWpGetTags();
  }
  if (!wpClient) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const { data, response } = await wpClient.GET("/tags", {
        params: { query: { per_page: 100 } },
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

/** タグ一覧。失敗時は空配列。 */
export const getTags = async (options?: WpFetchOptions): Promise<WPTag[]> =>
  (await fetchTags(options)) ?? [];

/** 全タグからシャッフルして先頭 `count` 件を返す。 */
export const pickRandomTags = async (
  count: number,
  options?: WpFetchOptions,
): Promise<WPTag[]> => {
  const tags = await getTags(options);
  return shuffle(tags).slice(0, Math.max(0, count));
};

/** スラッグで 1 件取得。OpenAPI スキーマに slug パラメータが未定義のため生 fetch を使用。 */
export const getTagBySlug = async (
  slug: string,
  options?: WpFetchOptions,
): Promise<WPTag | null> => {
  if (!wpApiBaseUrl) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const u = new URL(`${wpApiBaseUrl}/tags`);
      u.searchParams.set("slug", slug);
      u.searchParams.set("per_page", "1");
      u.searchParams.set("_embed", "1");
      u.searchParams.set("acf_format", "standard");
      const res = await fetch(u.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const json: unknown = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        const item = json[0] as Record<string, unknown>;
        if (typeof item.id === "number" && typeof item.slug === "string" && typeof item.name === "string") {
          return { id: item.id, slug: item.slug, name: item.name, count: typeof item.count === "number" ? item.count : 0 };
        }
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
