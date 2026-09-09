/**
 * YouTube で無料配信中の記事一覧エンドポイント（`/wp-json/v1/youtube-free-list`）。
 *
 * ACF `youtube.status` が `streaming`（＝無料公開）かつ `youtube.price` が 0 の
 * 記事だけを、絞り込み・ソート・ページング済みで返す。
 *
 * YouTube の「見放題」は他サービスと意味が違い、サブスクではなく**誰でも無料で
 * 観られる**ことを指す。配給会社の公式チャンネルが期間限定で本編を公開する
 * ケースがこれにあたるため、`channelName` と `streamingStartedAt` を持つ。
 *
 * `/v1/vod-list?vod=youtube` はレンタル・購入も含むため代用できない。
 *
 * @see katsumascore_wordpress_theme/docs/feature/YOUTUBE_FREE_LIST_API_SPEC.md
 */
import { wpRestBaseUrl, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";
import { isWpMockMode } from "@/libs/wpMockMode";
import { mockYoutubeFreeList } from "@/mocks/wp/mockYoutubeFreeList";

/**
 * 一覧のソート種別。
 *
 * - `streaming` … 無料配信の開始日（ACF `youtube.streaming_started_at`）の新しい順
 * - `new` … 記事の公開日の新しい順
 * - `score` … レビュースコアの高い順
 */
export type YoutubeFreeListFilter = "streaming" | "new" | "score";

export type YoutubeFreeListParams = {
  lang: "ja" | "en";
  page: number;
  perPage: number;
  filter: YoutubeFreeListFilter;
  /** カテゴリスラッグ（`movie` / `anime` / `drama`）。カンマ区切りで OR */
  category?: string;
  /** `genre` タクソノミーのスラッグ。カンマ区切りで OR */
  genre?: string;
  /** `post_tag` のスラッグ。カンマ区切りで OR */
  tag?: string;
};

export type YoutubeFreeListTerm = {
  id: number;
  slug: string;
  name: string;
};

/** `/v1/youtube-free-list` が返す1記事分のデータ。 */
export type YoutubeFreeListItem = {
  id: number;
  slug: string;
  lang: string;
  title: string;
  excerpt: string;
  date: string;
  modified: string;
  featuredImage: { url: string; width: number; height: number; alt: string } | null;
  score: number | null;
  /** 無料公開している YouTube 動画の URL。ACF 未入力は null */
  youtubeUrl: string | null;
  /** 無料公開しているチャンネル名（例: 【公式】プレシディオチャンネル）。未取得は null */
  channelName: string | null;
  /** 無料配信の開始日（`Y-m-d`）。未入力は null */
  streamingStartedAt: string | null;
  categories: YoutubeFreeListTerm[];
  genres: YoutubeFreeListTerm[];
  tags: YoutubeFreeListTerm[];
};

/** フィルタ選択肢。無料配信中の記事に実際に紐づくタームのみが返る。 */
export type YoutubeFreeListFilterOptions = {
  categories: { slug: string; name: string }[];
  genres: { slug: string; name: string }[];
  tags: { slug: string; name: string }[];
};

export type YoutubeFreeListResponse = {
  items: YoutubeFreeListItem[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
  filterOptions: YoutubeFreeListFilterOptions;
};

/** `YoutubeFreeListParams` を REST のクエリ文字列へ組み立てる。 */
const buildQuery = (params: YoutubeFreeListParams): string => {
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
 * YouTube で無料配信中の記事一覧を取得する。失敗時は `null`。
 *
 * 空配列ではなく `null` を返すのは、「無料配信0件」と「取得失敗」を
 * 呼び出し側が区別できないと、失敗が無言のまま正常応答になってしまうため。
 *
 * WP 側は ACF の postmeta キーが見つからない場合に 501 を返す（明示的な失敗）。
 * 再試行しても状況は変わらないため、501 はログを残して即 `null` にする。
 */
export const getYoutubeFreeList = async (
  params: YoutubeFreeListParams,
  options?: WpFetchOptions,
): Promise<YoutubeFreeListResponse | null> => {
  // 他エンドポイントと同様、モックモード（既定で development）では実 API を叩かない
  if (isWpMockMode()) return mockYoutubeFreeList(params);
  if (!wpRestBaseUrl) return null;

  const url = `${wpRestBaseUrl}/v1/youtube-free-list?${buildQuery(params)}`;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        // 501 = YouTube 配信状況の postmeta キーが存在しない。ACF の保存形式を確認する
        if (res.status === 501) {
          console.error("[getYoutubeFreeList] WP が 501 を返した（youtube_status の postmeta キーが見つからない）");
          return null;
        }
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const data = (await res.json()) as unknown;
      if (typeof data !== "object" || data === null || !Array.isArray((data as YoutubeFreeListResponse).items)) {
        return null;
      }
      const parsed = data as YoutubeFreeListResponse;
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
