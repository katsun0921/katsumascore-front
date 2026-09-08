/**
 * 現在劇場公開中の記事一覧エンドポイント（`/wp-json/v1/theater-list`）。
 *
 * ACF `cinema_info_filed.is_cinema_showing` が立っている記事だけを、
 * 絞り込み・ソート・ページング済みで返す。素の `/wp/v2/posts` は
 * `meta_key` / `meta_value` を黙って無視して全件返すため、
 * 「上映中だけ」をフロント側で安全に表現できない。
 *
 * 週次まとめ記事の CPT（`theater_release` / `getTheaterReleases`）とは別物。
 * こちらは個別のレビュー記事（`post`）の一覧である。
 *
 * @see katsumascore_wordpress_theme/docs/feature/THEATER_LIST_API_SPEC.md
 */
import { wpRestBaseUrl, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";
import { isWpMockMode } from "@/libs/wpMockMode";
import { mockTheaterList } from "@/mocks/wp/mockTheaterList";

/**
 * 一覧のソート種別。
 *
 * - `release` … 劇場公開日（ACF `release.release_date`）の新しい順
 * - `new` … 記事の公開日の新しい順
 * - `score` … レビュースコアの高い順
 */
export type TheaterListFilter = "release" | "new" | "score";

export type TheaterListParams = {
  lang: "ja" | "en";
  page: number;
  perPage: number;
  filter: TheaterListFilter;
  /** カテゴリスラッグ（`movie` / `anime` / `drama`）。カンマ区切りで OR */
  category?: string;
  /** `genre` タクソノミーのスラッグ。カンマ区切りで OR */
  genre?: string;
  /** `post_tag` のスラッグ。カンマ区切りで OR */
  tag?: string;
};

export type TheaterListTerm = {
  id: number;
  slug: string;
  name: string;
};

/** `/v1/theater-list` が返す1記事分のデータ。 */
export type TheaterListItem = {
  id: number;
  slug: string;
  lang: string;
  title: string;
  excerpt: string;
  date: string;
  modified: string;
  featuredImage: { url: string; width: number; height: number; alt: string } | null;
  score: number | null;
  /** 劇場公開日（`Y-m-d`）。ACF 未入力は null */
  releaseDate: string | null;
  /** 上映劇場ページの URL。ACF 未入力は null */
  cinemaUrl: string | null;
  categories: TheaterListTerm[];
  genres: TheaterListTerm[];
  tags: TheaterListTerm[];
};

/** フィルタ選択肢。上映中の記事に実際に紐づくタームのみが返る。 */
export type TheaterListFilterOptions = {
  categories: { slug: string; name: string }[];
  genres: { slug: string; name: string }[];
  tags: { slug: string; name: string }[];
};

export type TheaterListResponse = {
  items: TheaterListItem[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
  filterOptions: TheaterListFilterOptions;
};

/** `TheaterListParams` を REST のクエリ文字列へ組み立てる。 */
const buildQuery = (params: TheaterListParams): string => {
  const sp = new URLSearchParams({
    lang: params.lang,
    page: String(params.page),
    per_page: String(params.perPage),
    filter: params.filter,
  });
  if (params.category) sp.set("category", params.category);
  if (params.genre) sp.set("genre", params.genre);
  if (params.tag) sp.set("tag", params.tag);
  return sp.toString();
};

/**
 * 上映中の記事一覧を取得する。失敗時は `null`。
 *
 * 空配列ではなく `null` を返すのは、「上映中0件」と「取得失敗」を
 * 呼び出し側が区別できないと、失敗が無言のまま正常応答になってしまうため。
 *
 * WP 側は ACF の postmeta キーが見つからない場合に 501 を返す（明示的な失敗）。
 * 再試行しても状況は変わらないため、501 はログを残して即 `null` にする。
 */
export const getTheaterList = async (
  params: TheaterListParams,
  options?: WpFetchOptions,
): Promise<TheaterListResponse | null> => {
  // 他エンドポイントと同様、モックモード（既定で development）では実 API を叩かない
  if (isWpMockMode()) return mockTheaterList(params);
  if (!wpRestBaseUrl) return null;

  const url = `${wpRestBaseUrl}/v1/theater-list?${buildQuery(params)}`;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        // 501 = 上映中フラグの postmeta キーが存在しない。ACF の保存形式を確認する
        if (res.status === 501) {
          console.error("[getTheaterList] WP が 501 を返した（上映中フラグの postmeta キーが見つからない）");
          return null;
        }
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const data = (await res.json()) as unknown;
      if (typeof data !== "object" || data === null || !Array.isArray((data as TheaterListResponse).items)) {
        return null;
      }
      const parsed = data as TheaterListResponse;
      return {
        items: parsed.items,
        meta: parsed.meta,
        filterOptions: parsed.filterOptions ?? { categories: [], genres: [], tags: [] },
      };
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};
