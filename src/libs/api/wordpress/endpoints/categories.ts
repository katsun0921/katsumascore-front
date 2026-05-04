/**
 * `/categories` エンドポイントの取得とアーカイブ向けの解決ヘルパー。
 */
import type { components } from "../generated/wp-schema";
import { wpClient, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";

type WPCategory = components["schemas"]["WPCategory"];

/** カテゴリ一覧を再試行付きで取得する。 */
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

/** 言語指定付きカテゴリ一覧。失敗時は空配列。 */
export const getCategories = async (
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPCategory[]> => (await fetchCategories(lang, options)) ?? [];

/**
 * アーカイブ・スラッグ解決用のカテゴリ一覧。
 * Polylang 不使用の環境では `lang=en` の `/categories` が空配列になりうるが、ターム ID は投稿と共通のため
 * その場合は `lang` 無しで再取得する。
 */
export const getCategoriesForArchiveResolve = async (
  locale?: string,
  options?: WpFetchOptions,
): Promise<WPCategory[]> => {
  if (locale === "ja" || locale === "en") {
    const localized = await getCategories(locale, options);
    if (localized.length > 0) return localized;
  }
  return getCategories(undefined, options);
};

/** 解決済みカテゴリ一覧からスラッグで 1 件探す。 */
export const getCategoryBySlug = async (
  slug: string,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPCategory | null> => {
  const categories = await getCategoriesForArchiveResolve(lang, options);
  return categories.find((c) => c.slug === slug) ?? null;
};
