/**
 * `/seasonal_review` CPT エンドポイントの取得ヘルパー（OpenAPI スキーマ外のため生 fetch を使用）。
 *
 * `seasonal_review` は季節ごとの鑑賞まとめハブ記事を格納するカスタム投稿タイプ。
 * 各作品の個別記事（通常の post）へのリンクと一口メモを束ねる。
 * CPT定義: katsumascore_wordpress_theme/acf-json/post-type-seasonal-review.json
 *
 * 移行前は固定ページ（親 `seasonal-anime-and-dramas-reviews` の子ページ）として
 * 運用しており、公開URL `/seasonal-reviews/{slug}` は移行前後で変わらない。
 */
import { wpApiBaseUrl, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";

/** `entries` リピーターの1行。まとめページに並ぶ作品1件分。 */
export type WPSeasonalReviewEntry = {
  /** 紐付く個別作品記事。`post_object` の返り値（return_format: object） */
  post?: {
    ID: number;
    post_title: string;
    post_name: string;
  } | number | false;
  /** まとめページ内の見出し分け */
  category?: "anime" | "drama" | "movie" | "";
  /** 一口メモ（60〜100字想定・maxlength 120） */
  memo?: string;
  /** 同一区分内での並び順。未入力なら行順を使う */
  display_order?: number | string | "";
};

/** `works.vods` リピーターの1行。作品が視聴できる配信サービス1件分。 */
export type WPSeasonalReviewWorkVod = {
  /** ACF select の値（`danime` / `abema` / `other` など） */
  service?: string;
  /** `service` が `other` のときのサービス名 */
  service_other?: string;
  /** 注記。`exclusive` / `world_exclusive` / `premium`、無ければ空 */
  note?: string | false;
};

/**
 * `works` リピーターの1行。今クールのラインナップ1作品分。
 *
 * `entries` と違い `post`（レビュー記事）は任意で、レビュー未執筆でも登録できる。
 */
export type WPSeasonalReviewWork = {
  title?: string;
  category?: "anime" | "drama" | "movie" | "";
  display_order?: number | string | "";
  official_url?: string;
  /** レビュー記事。未執筆なら false / null を返す */
  post?:
    | {
        ID: number;
        post_title: string;
        post_name: string;
      }
    | number
    | false
    | null;
  description?: string;
  /** `available` / `undecided` / `undecided_planned` / `undecided_sequential` */
  delivery_status?: string;
  /** ACF true_false は 1 / 0 を返す */
  has_other_services?: boolean | number | "";
  /** ACF repeater は空のとき false を返す */
  vods?: WPSeasonalReviewWorkVod[] | false;
};

/** `seasonal_review` CPT の REST レスポンス（必要なフィールドのみ）。 */
export type WPSeasonalReview = {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt?: { rendered: string };
  acf?: {
    year?: number | string | "";
    quarter?: "q1" | "q2" | "q3" | "q4" | "";
    /** `2026q3` 形式。一覧の並び替えキー（辞書順＝時系列順） */
    sort_key?: string;
    /** ACF repeater は空のとき false を返す */
    entries?: WPSeasonalReviewEntry[] | false;
    /** 今クールのラインナップ。ACF repeater は空のとき false を返す */
    works?: WPSeasonalReviewWork[] | false;
  };
  _embedded?: {
    "wp:featuredmedia"?: { source_url?: string }[];
  };
};

const buildSeasonalReviewUrl = (path: string): string | null => {
  if (!wpApiBaseUrl) return null;
  return `${wpApiBaseUrl}${path}`;
};

/** 再試行付きで seasonal_review エンドポイントを fetch する。 */
const fetchSeasonalReview = async <T>(
  path: string,
  options?: WpFetchOptions,
): Promise<T | null> => {
  const url = buildSeasonalReviewUrl(path);
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

/** slug で seasonal_review 記事を取得する。 */
export const getSeasonalReviewBySlug = async (
  slug: string,
  options?: WpFetchOptions,
): Promise<WPSeasonalReview | null> => {
  const results = await fetchSeasonalReview<WPSeasonalReview[]>(
    `/seasonal_review?slug=${encodeURIComponent(slug)}&acf_format=standard&_embed=1`,
    options,
  );
  return results?.[0] ?? null;
};

/**
 * seasonal_review 記事を取得する（アーカイブ・サイトマップ生成用）。
 *
 * 並び順は呼び出し側で `sort_key` により決める。WordPress の `orderby` は
 * ACF フィールドを解さないため、ここでは取得のみを行う。
 * 年4本のため、既定の 100 件で25年分をカバーする。
 */
export const getSeasonalReviews = async (
  perPage = 100,
  options?: WpFetchOptions,
): Promise<WPSeasonalReview[]> =>
  (await fetchSeasonalReview<WPSeasonalReview[]>(
    `/seasonal_review?acf_format=standard&_embed=1&per_page=${perPage}&orderby=date&order=desc`,
    options,
  )) ?? [];
