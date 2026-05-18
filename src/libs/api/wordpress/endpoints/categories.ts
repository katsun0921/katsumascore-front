/**
 * `/categories` エンドポイントの取得とアーカイブ向けの解決ヘルパー。
 */
import type { components } from "../generated/wp-schema";
import { wpApiBaseUrl, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";
import { isWpMockMode } from "@/libs/wpMockMode";
import { mockWpGetCategories } from "@/mocks/wp/mockWpQueries";

type WPCategory = components["schemas"]["WPCategory"];

/**
 * カテゴリ一覧を再試行付きで取得する。
 * OpenAPI スキーマに per_page が定義されていないため生 fetch を使い per_page=100 を明示する。
 * デフォルト(10件)では Polylang 等で日英カテゴリが混在する場合に一部カテゴリが欠落する。
 */
const fetchCategories = async (
  options?: WpFetchOptions,
): Promise<WPCategory[] | null> => {
  if (isWpMockMode()) {
    return mockWpGetCategories();
  }
  if (!wpApiBaseUrl) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  const url = `${wpApiBaseUrl}/categories?per_page=100&_embed=1&acf_format=standard`;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) {
        if (!shouldRetryStatus(response.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const data: unknown = await response.json();
      return Array.isArray(data) ? (data as WPCategory[]) : null;
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
