/**
 * カテゴリ記事一覧の専用エンドポイント（`/wp-json/v1/category-list`）。
 *
 * 従来は WP から全記事（映画は466件 = per_page=100 × 5ページ）を取得して
 * メモリ上でフィルタ・ソートしていたため実測約6.4秒かかっていた。
 * 絞り込み・ソート・ページングを WP 側の SQL で行い、必要な1ページ分だけを取得する。
 *
 * @see katsumascore_wordpress_theme/docs/feature/CATEGORY_LIST_API_SPEC.md
 */
import { wpRestBaseUrl, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";
import { isWpMockMode } from "@/libs/wpMockMode";
import { mockCategoryList } from "@/mocks/wp/mockCategoryList";
import type { VodService } from "@/libs/vod";

/** 一覧のソート・絞り込み種別。フロントの `listFilters` と同じ語彙を使う。 */
export type CategoryListFilter = "score" | "new" | "streaming";

export type CategoryListParams = {
  /** カテゴリスラッグ（`movie` / `anime` / `drama`） */
  category: string;
  lang: "ja" | "en";
  page: number;
  perPage: number;
  filter: CategoryListFilter;
  /** `genre` タクソノミーのスラッグ。カンマ区切りで OR */
  genre?: string;
  /** `post_tag` のスラッグ。カンマ区切りで OR */
  tag?: string;
};

type CategoryListTerm = {
  id: number;
  slug: string;
  name: string;
};

/** `/v1/category-list` が返す1記事分のデータ。 */
export type CategoryListItem = {
  id: number;
  slug: string;
  lang: string;
  title: string;
  excerpt: string;
  date: string;
  modified: string;
  featuredImage: { url: string; width: number; height: number; alt: string } | null;
  score: number | null;
  category: string;
  /** ACF のフィールド名（`amazon_prime_video` 等）。`VodService` とは別語彙 */
  vods: string[];
  genres: CategoryListTerm[];
  tags: CategoryListTerm[];
};

/** フィルタ選択肢。そのカテゴリ×言語に実在するタームのみが返る。 */
export type CategoryListFilterOptions = {
  genres: { slug: string; name: string }[];
  tags: { slug: string; name: string }[];
};

export type CategoryListResponse = {
  items: CategoryListItem[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
  filterOptions: CategoryListFilterOptions;
};

/**
 * WP の ACF フィールド名 → フロントの `VodService` への対応。
 *
 * WP は ACF のフィールド名をそのまま返すため、`prime-video` 等の
 * フロント側の語彙へ変換する必要がある。
 * 対象4フィールドは WP 側の `KATSUMASCORE_STREAMING_ACF_FIELDS` と対応している。
 */
const ACF_FIELD_TO_VOD_SERVICE: Record<string, VodService> = {
  netflix: "netflix",
  amazon_prime_video: "prime-video",
  hulu: "hulu",
  unext: "unext",
};

/** WP が返す ACF フィールド名の配列を `VodService[]` へ変換する。未知の名前は捨てる。 */
export const toVodServices = (acfFieldNames: string[]): VodService[] => {
  const services: VodService[] = [];
  for (const name of acfFieldNames) {
    const service = ACF_FIELD_TO_VOD_SERVICE[name];
    if (service !== undefined) services.push(service);
  }
  return services;
};

/** `CategoryListParams` を REST のクエリ文字列へ組み立てる。 */
const buildQuery = (params: CategoryListParams): string => {
  const sp = new URLSearchParams({
    category: params.category,
    lang: params.lang,
    page: String(params.page),
    per_page: String(params.perPage),
    filter: params.filter,
  });
  if (params.genre) sp.set("genre", params.genre);
  if (params.tag) sp.set("tag", params.tag);
  return sp.toString();
};

/**
 * カテゴリ記事一覧を取得する。失敗時は `null`。
 *
 * 空配列ではなく `null` を返すのは、「記事0件」と「取得失敗」を
 * 呼び出し側が区別できないと、失敗が無言のまま正常応答になってしまうため。
 */
export const getCategoryList = async (
  params: CategoryListParams,
  options?: WpFetchOptions,
): Promise<CategoryListResponse | null> => {
  // 他エンドポイントと同様、モックモード（既定で development）では実 API を叩かない
  if (isWpMockMode()) return mockCategoryList(params);
  if (!wpRestBaseUrl) return null;

  const url = `${wpRestBaseUrl}/v1/category-list?${buildQuery(params)}`;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };

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
      const data = (await res.json()) as unknown;
      if (typeof data !== "object" || data === null || !Array.isArray((data as CategoryListResponse).items)) {
        return null;
      }
      const parsed = data as CategoryListResponse;
      // filterOptions は WP 側の後方追加。未対応版が返ってきても落とさない
      return {
        items: parsed.items,
        meta: parsed.meta,
        filterOptions: parsed.filterOptions ?? { genres: [], tags: [] },
      };
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};
