/**
 * `/categories` エンドポイントの取得とアーカイブ向けの解決ヘルパー。
 */
import type { components } from "../generated/wp-schema";
import { wpClient, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";
import { isWpMockMode } from "@/libs/wpMockMode";
import { mockWpGetCategories } from "@/mocks/wp/mockWpQueries";

type WPCategory = components["schemas"]["WPCategory"];

/** カテゴリ一覧を再試行付きで取得する。 */
const fetchCategories = async (
  options?: WpFetchOptions,
): Promise<WPCategory[] | null> => {
  if (isWpMockMode()) {
    return mockWpGetCategories();
  }
  if (!wpClient) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const { data, response } = await wpClient.GET("/categories", {
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

/** カテゴリ一覧。失敗時は空配列。 */
export const getCategories = async (
  options?: WpFetchOptions,
): Promise<WPCategory[]> => (await fetchCategories(options)) ?? [];

/** アーカイブ・スラッグ解決用のカテゴリ一覧。 */
export const getCategoriesForArchiveResolve = async (
  options?: WpFetchOptions,
): Promise<WPCategory[]> => getCategories(options);

/** 解決済みカテゴリ一覧からスラッグで 1 件探す。 */
export const getCategoryBySlug = async (
  slug: string,
  options?: WpFetchOptions,
): Promise<WPCategory | null> => {
  const categories = await getCategoriesForArchiveResolve(options);
  return categories.find((c) => c.slug === slug) ?? null;
};
