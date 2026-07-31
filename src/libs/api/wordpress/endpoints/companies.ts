/**
 * `/companies` CPT エンドポイントの取得ヘルパー（OpenAPI スキーマ外のため生 fetch を使用）。
 */
import type { components } from "../generated/wp-schema";
import { wpApiBaseUrl, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";

type WPCompany = components["schemas"]["WPCompany"];

const buildCompaniesUrl = (path: string): string | null => {
  if (!wpApiBaseUrl) return null;
  return `${wpApiBaseUrl}${path}`;
};

/** 再試行付きで companies エンドポイントを fetch する。 */
const fetchCompanies = async <T>(
  path: string,
  options?: WpFetchOptions,
): Promise<T | null> => {
  const url = buildCompaniesUrl(path);
  if (!url) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      return (await res.json()) as T;
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

/** ID で company を取得する。 */
export const getCompany = async (
  id: number,
  options?: WpFetchOptions,
): Promise<WPCompany | null> =>
  fetchCompanies<WPCompany>(`/companies/${id}?acf_format=standard`, options);

/** slug で company を取得する。 */
export const getCompanyBySlug = async (
  slug: string,
  options?: WpFetchOptions,
): Promise<WPCompany | null> => {
  const results = await fetchCompanies<WPCompany[]>(
    `/companies?slug=${encodeURIComponent(slug)}&acf_format=standard`,
    options,
  );
  return results?.[0] ?? null;
};
