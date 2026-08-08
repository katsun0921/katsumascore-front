/**
 * `/theater_release` CPT エンドポイントの取得ヘルパー（OpenAPI スキーマ外のため生 fetch を使用）。
 *
 * `theater_release` は週次の劇場公開まとめ記事を格納するカスタム投稿タイプ。
 * `vod_scraping_api` の news_bot（theater_publish）が REST API 経由で投稿する。
 * CPT定義: katsumascore_wordpress_theme/acf-json/post-type-theater-release.json
 */
import { wpApiBaseUrl, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";

/** `theater_release` CPT の REST レスポンス（必要なフィールドのみ）。 */
export type WPTheaterRelease = {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt?: { rendered: string };
};

const buildTheaterReleaseUrl = (path: string): string | null => {
  if (!wpApiBaseUrl) return null;
  return `${wpApiBaseUrl}${path}`;
};

/** 再試行付きで theater_release エンドポイントを fetch する。 */
const fetchTheaterRelease = async <T>(
  path: string,
  options?: WpFetchOptions,
): Promise<T | null> => {
  const url = buildTheaterReleaseUrl(path);
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

/** slug で theater_release 記事を取得する。 */
export const getTheaterReleaseBySlug = async (
  slug: string,
  options?: WpFetchOptions,
): Promise<WPTheaterRelease | null> => {
  const results = await fetchTheaterRelease<WPTheaterRelease[]>(
    `/theater_release?slug=${encodeURIComponent(slug)}&acf_format=standard`,
    options,
  );
  return results?.[0] ?? null;
};

/**
 * theater_release 記事を新しい順に取得する（アーカイブ・サイトマップ生成用）。
 *
 * 週次で1件ずつ増えるため、既定の 100 件で約2年分をカバーする。
 */
export const getTheaterReleases = async (
  perPage = 100,
  options?: WpFetchOptions,
): Promise<WPTheaterRelease[]> =>
  (await fetchTheaterRelease<WPTheaterRelease[]>(
    `/theater_release?acf_format=standard&per_page=${perPage}&orderby=date&order=desc`,
    options,
  )) ?? [];
