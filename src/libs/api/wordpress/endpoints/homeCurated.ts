/**
 * TOP のキュレーション枠エンドポイント（`/wp-json/v1/home-curated`）。
 *
 * ACF オプションページ「TOP キュレーション」で編集部が選んだ枠を、記事・シリーズの解決済みで返す。
 * OpenAPI スキーマ外のため生 fetch を使用する。
 *
 * @see katsumascore_wordpress_theme/docs/feature/HOME_CURATED_API_SPEC.md
 */
import { wpRestBaseUrl, defaultFetchOptions, sleep, shouldRetryStatus } from "../client";
import type { WpFetchOptions } from "../client";
import { isWpMockMode } from "@/libs/wpMockMode";
import type { TheaterListItem } from "./theaterList";

/** シリーズ / フランチャイズ枠の 1 項目。 */
export type WPCuratedSeriesItem = {
  id: number;
  slug: string;
  title: string;
  /** 未入力は空文字 */
  description: string;
  image: string | null;
  postCount: number;
  /** 作品公開日の昇順 */
  posts: TheaterListItem[];
};

type WPCuratedBase = {
  label: string;
  /** 未入力は空文字 */
  description: string;
  seeAllHref: string | null;
};

/** TOP のキュレーション枠 1 ブロック。 */
export type WPCuratedCollection = WPCuratedBase &
  (
    | { kind: "posts"; items: TheaterListItem[] }
    | { kind: "series" | "franchise"; items: WPCuratedSeriesItem[] }
  );

type UnknownRecord = Record<string, unknown>;

/** オブジェクトかどうかを判定する。 */
const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** 文字列ならそのまま、それ以外（`false` / `null` / 未設定）は空文字にする。 */
const toStr = (value: unknown): string => (typeof value === "string" ? value : "");

/** 非空文字列ならそのまま、それ以外は `null` にする。 */
const toStrOrNull = (value: unknown): string | null =>
  typeof value === "string" && value !== "" ? value : null;

/** 配列ならそのまま、それ以外は空配列にする。 */
const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

/** タクソノミー項目（`{ id, slug, name }`）の配列を検査して返す。不正な行は捨てる。 */
const parseTerms = (value: unknown): TheaterListItem["categories"] =>
  toArray(value).flatMap((row) =>
    isRecord(row) && typeof row.slug === "string" && typeof row.name === "string"
      ? [{ id: typeof row.id === "number" ? row.id : 0, slug: row.slug, name: row.name }]
      : [],
  );

/** アイキャッチ（`{ url, width, height, alt }`）を検査して返す。url が無ければ `null`。 */
const parseFeaturedImage = (value: unknown): TheaterListItem["featuredImage"] => {
  if (!isRecord(value) || typeof value.url !== "string" || value.url === "") return null;
  return {
    url: value.url,
    width: typeof value.width === "number" ? value.width : 0,
    height: typeof value.height === "number" ? value.height : 0,
    alt: toStr(value.alt),
  };
};

/** 記事 1 件を検査して `TheaterListItem` 形へ正規化する。必須項目が欠ければ `null`。 */
const parsePost = (value: unknown): TheaterListItem | null => {
  if (!isRecord(value)) return null;
  const { id, slug, title, date } = value;
  if (typeof id !== "number" || typeof slug !== "string" || typeof title !== "string" || typeof date !== "string") {
    return null;
  }
  return {
    id,
    slug,
    lang: toStr(value.lang),
    title,
    excerpt: toStr(value.excerpt),
    date,
    modified: typeof value.modified === "string" ? value.modified : date,
    featuredImage: parseFeaturedImage(value.featuredImage),
    // ACF 未設定時は false / null / "" になりうるため、数値のときだけ採用する
    score: typeof value.score === "number" ? value.score : null,
    releaseDate: null,
    cinemaUrl: null,
    categories: parseTerms(value.categories),
    genres: parseTerms(value.genres),
    tags: parseTerms(value.tags),
  };
};

/** 記事配列を検査する。不正な行は捨てる。 */
const parsePosts = (value: unknown): TheaterListItem[] =>
  toArray(value).flatMap((row) => {
    const post = parsePost(row);
    return post ? [post] : [];
  });

/** シリーズ項目 1 件を検査する。必須項目が欠ける・作品記事が 0 件なら `null`。 */
const parseSeriesItem = (value: unknown): WPCuratedSeriesItem | null => {
  if (!isRecord(value) || typeof value.id !== "number" || typeof value.slug !== "string") return null;
  const posts = parsePosts(value.posts);
  if (posts.length === 0) return null;
  return {
    id: value.id,
    slug: value.slug,
    title: toStr(value.title),
    description: toStr(value.description),
    image: toStrOrNull(value.image),
    postCount: typeof value.postCount === "number" ? value.postCount : posts.length,
    posts,
  };
};

/** 枠 1 件を検査する。未知の `kind`・項目 0 件の枠は `null`（ACF の Radio に将来値が増えても型安全を保つ）。 */
const parseCollection = (value: unknown): WPCuratedCollection | null => {
  if (!isRecord(value) || typeof value.label !== "string") return null;
  const base: WPCuratedBase = {
    label: value.label,
    description: toStr(value.description),
    seeAllHref: toStrOrNull(value.seeAllHref),
  };

  if (value.kind === "posts") {
    const items = parsePosts(value.items);
    return items.length > 0 ? { ...base, kind: "posts", items } : null;
  }
  if (value.kind === "series" || value.kind === "franchise") {
    const items = toArray(value.items).flatMap((row) => {
      const item = parseSeriesItem(row);
      return item ? [item] : [];
    });
    return items.length > 0 ? { ...base, kind: value.kind, items } : null;
  }
  return null;
};

/** `/v1/home-curated` のレスポンス JSON を検査し、描画可能な枠だけを WP が返した順で返す。 */
export const parseHomeCuratedResponse = (json: unknown): WPCuratedCollection[] => {
  if (!isRecord(json)) return [];
  return toArray(json.collections).flatMap((row) => {
    const collection = parseCollection(row);
    return collection ? [collection] : [];
  });
};

/**
 * TOP のキュレーション枠を取得する。
 *
 * 枠が無いことは正常状態であり、取得失敗・未設定・モックモードでも空配列を返す
 * （呼び出し側に分岐を増やさず、TOP の既存セクションを落とさないため）。
 */
export const getHomeCuratedCollections = async (
  lang: "ja" | "en",
  options?: WpFetchOptions,
): Promise<WPCuratedCollection[]> => {
  if (isWpMockMode() || !wpRestBaseUrl) return [];

  const url = `${wpRestBaseUrl}/v1/home-curated?lang=${lang}`;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return [];
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      return parseHomeCuratedResponse((await res.json()) as unknown);
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return [];
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return [];
};
