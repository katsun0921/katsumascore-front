/**
 * サイトマップ専用の投稿一覧取得。
 *
 * 通常の `getPostsPagedMerge` は `_embed=1` と全フィールド（content 含む）を要求するため、
 * `per_page=100` でレスポンスが約 7MB・約 6 秒に達し、既定 3 秒のタイムアウトで必ず失敗していた。
 * サイトマップに必要なのは URL 組み立て用の slug / カテゴリ / 言語と lastmod だけなので、
 * `_embed` を外し `_fields` を絞って取得する（実測 21KB・1 ページあたり約 1.1〜1.6 秒）。
 * あわせてタイムアウトも `SITEMAP_FETCH_OPTIONS` で延長している。
 */
import { wpApiBaseUrl, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";
import { isWpMockMode } from "@/libs/wpMockMode";
import { mockWpPostsList } from "@/mocks/wp/mockWpQueries";

/** サイトマップ生成に必要な最小フィールド。`content` / `_embedded` は要求しない。 */
const SITEMAP_FIELDS = "id,slug,date,modified,categories,acf.lang";

/**
 * サイトマップ取得の既定オプション。共通既定（3 秒）を上書きする。
 *
 * `_embed` 除去後の 1 ページは実測 1.1〜1.6 秒だが、
 * - 全 6 ページ中 5 ページを並列取得するため単発計測より遅くなる
 * - 本番は Workers 経由・WP 高負荷時・キャッシュミスでさらに伸びうる
 * - サイトマップはユーザー体感を伴わない裏側の処理で、待てる代わりに失敗の代償が大きい
 *
 * ため、3 秒では余裕がない。`homeStaticProps`（15 秒）と同様に呼び出し側で明示的に延長する。
 */
const SITEMAP_FETCH_OPTIONS: WpFetchOptions = {
  timeoutMs: 15_000,
  maxRetries: 2,
};

/** サイトマップ用に絞り込んだ投稿レスポンス。 */
export type WPSitemapPost = {
  id: number;
  slug: string;
  date: string;
  modified?: string;
  /** カテゴリのターム ID 配列（`_embed` を使わないため slug ではなく ID で返る） */
  categories?: number[];
  acf?: { lang?: string };
};

type SitemapPostsPage = {
  items: WPSitemapPost[];
  totalPages: number;
};

/** 1 ページ分を取得し、`X-WP-TotalPages` を添えて返す。失敗時は `null`。 */
const fetchSitemapPostsPage = async (
  page: number,
  perPage: number,
  options?: WpFetchOptions,
): Promise<SitemapPostsPage | null> => {
  if (!wpApiBaseUrl) return null;
  const url =
    `${wpApiBaseUrl}/posts?acf_format=standard&_embed=0` +
    `&_fields=${SITEMAP_FIELDS}&per_page=${perPage}&page=${page}`;
  // 共通既定 → サイトマップ既定 → 呼び出し側指定 の順に上書きする
  const { timeoutMs, maxRetries, initialBackoffMs } = {
    ...defaultFetchOptions,
    ...SITEMAP_FETCH_OPTIONS,
    ...options,
  };

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
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
      const data: unknown = await res.json();
      const items = Array.isArray(data) ? (data as WPSitemapPost[]) : [];
      const totalPages = Number.parseInt(res.headers.get("X-WP-TotalPages") ?? "1", 10) || 1;
      return { items, totalPages };
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

/**
 * サイトマップ用に投稿を全ページ取得して結合する。
 * 1 ページ目の取得に失敗した場合のみ `null` を返し、呼び出し側が「WP 取得失敗」を検知できるようにする
 * （空配列だと「記事が 0 件」と区別できず、壊れたサイトマップを 200 で返してしまうため）。
 */
export const getSitemapPosts = async (
  perPage = 100,
  maxPages = 10,
  options?: WpFetchOptions,
): Promise<WPSitemapPost[] | null> => {
  if (maxPages < 1) return null;

  // モックモード（既定で development）では実 API を叩かずモックデータから組み立てる。
  // モック投稿は `categories` を持たず `_embedded` にタームを持つため、実 API と同じ形へ変換する
  if (isWpMockMode()) {
    return mockWpPostsList({ per_page: perPage, page: 1 }).map((p) => {
      const terms = (p as { _embedded?: { "wp:term"?: { id?: number }[][] } })._embedded?.["wp:term"]?.[0];
      const categoryId = Array.isArray(terms) ? terms[0]?.id : undefined;
      const raw = p as unknown as WPSitemapPost;
      return {
        id: raw.id,
        slug: raw.slug,
        date: raw.date,
        ...(raw.modified !== undefined ? { modified: raw.modified } : {}),
        ...(typeof categoryId === "number" ? { categories: [categoryId] } : {}),
        ...(raw.acf?.lang !== undefined ? { acf: { lang: raw.acf.lang } } : {}),
      };
    });
  }

  const first = await fetchSitemapPostsPage(1, perPage, options);
  if (!first) return null;

  const totalPages = Math.min(first.totalPages, maxPages);
  const results: WPSitemapPost[] = [...first.items];

  if (totalPages > 1) {
    const remaining = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
    const batches = await Promise.all(
      remaining.map((page) => fetchSitemapPostsPage(page, perPage, options)),
    );
    for (const batch of batches) {
      if (batch) results.push(...batch.items);
    }
  }

  // 重複除去（ページ跨ぎで同一記事が返ることがあるため）
  const seenIds = new Set<number>();
  return results.filter((p) => {
    if (seenIds.has(p.id)) return false;
    seenIds.add(p.id);
    return true;
  });
};
