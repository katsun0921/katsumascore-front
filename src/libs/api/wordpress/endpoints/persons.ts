/**
 * `/persons` CPT エンドポイントの取得ヘルパー（OpenAPI スキーマ外のため生 fetch を使用）。
 */
import type { components } from "../generated/wp-schema";
import { wpApiBaseUrl, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";

type WPPerson = components["schemas"]["WPPerson"];

const buildPersonsUrl = (path: string): string | null => {
  if (!wpApiBaseUrl) return null;
  return `${wpApiBaseUrl}${path}`;
};

/** 再試行付きで persons エンドポイントを fetch する。 */
const fetchPersons = async <T>(
  path: string,
  options?: WpFetchOptions,
): Promise<T | null> => {
  const url = buildPersonsUrl(path);
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

/** ID で person を取得する。 */
export const getPerson = async (
  id: number,
  options?: WpFetchOptions,
): Promise<WPPerson | null> =>
  fetchPersons<WPPerson>(`/wp/v2/persons/${id}?acf_format=standard`, options);

/** slug で person を取得する。 */
export const getPersonBySlug = async (
  slug: string,
  options?: WpFetchOptions,
): Promise<WPPerson | null> => {
  const results = await fetchPersons<WPPerson[]>(
    `/wp/v2/persons?slug=${encodeURIComponent(slug)}&acf_format=standard`,
    options,
  );
  return results?.[0] ?? null;
};

/** role で persons を取得する（actor / director）。 */
export const getPersonsByRole = async (
  role: "actor" | "director",
  perPage = 100,
  options?: WpFetchOptions,
): Promise<WPPerson[]> =>
  (await fetchPersons<WPPerson[]>(
    `/wp/v2/persons?acf_format=standard&per_page=${perPage}&acf[roles]=${role}`,
    options,
  )) ?? [];
