/**
 * カスタムタクソノミー `franchise` の一覧・スラッグ検索・ACFデータ取得。
 */
import {
  wpApiBaseUrl,
  defaultFetchOptions,
  sleep,
  shouldRetryStatus,
} from "../client";
import type { WpFetchOptions } from "../client";

/** franchise REST コレクション名（WP 側の `rest_base`）。 */
const FRANCHISE_REST_PATH = "franchise";

export type WPFranchiseTerm = {
  id: number;
  slug: string;
  name: string;
  count: number;
  acf?: WPFranchiseAcf;
};

export type WPFranchiseAcf = {
  /** 表示タイトル上書き */
  title_override?: string;
  /** シリーズ概要 */
  description?: string;
  /** キャッチコピー */
  catch_copy?: string;
  /** ヒーロー画像 */
  hero_image?: { url: string; alt?: string; width?: number; height?: number } | false;
  /** 開始年 */
  start_year?: number;
  /** 終了年 */
  end_year?: number;
  /** 原作者 */
  original_author?: string;
  /** 制作会社 */
  production_company?: string;
  /** 代表作品 ID */
  featured_post?: number | null;
  /** 表示順（asc / desc） */
  display_order?: "asc" | "desc";
  /** 時系列表示 ON/OFF */
  show_timeline?: boolean;
  /** スコア表示 ON/OFF */
  show_score?: boolean;
  /** 年表 */
  timeline_text?: Array<{ year: string; content: string }>;
  /** 見どころ */
  highlights?: Array<{ title: string; description: string }>;
  /** 外部リンク */
  related_links?: Array<{ label: string; url: string }>;
};

/** 生 REST レスポンスから `WPFranchiseTerm` を組み立てる。必須フィールドが欠ける場合は `null`。 */
const toWPFranchiseTerm = (x: unknown): WPFranchiseTerm | null => {
  if (typeof x !== "object" || x === null) return null;
  const o = x as Record<string, unknown>;
  const id = typeof o.id === "number" ? o.id : null;
  if (id === null) return null;
  if (typeof o.slug !== "string") return null;
  const name = typeof o.name === "string" ? o.name : null;
  if (name === null) return null;
  const count = typeof o.count === "number" ? o.count : 0;
  const acf = parseWPFranchiseAcf(o.acf);
  return { id, slug: o.slug, name, count, ...(acf !== undefined ? { acf } : {}) };
};

/** ACF フィールドを型安全に変換する。`false` / `null` / 未定義なら `undefined` を返す。 */
const parseWPFranchiseAcf = (raw: unknown): WPFranchiseAcf | undefined => {
  if (raw === false || raw === null || raw === undefined) return undefined;
  if (typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const r = raw as Record<string, unknown>;
  const result: WPFranchiseAcf = {};

  if (typeof r.title_override === "string") result.title_override = r.title_override;
  if (typeof r.description === "string") result.description = r.description;
  if (typeof r.catch_copy === "string") result.catch_copy = r.catch_copy;
  if (r.hero_image && typeof r.hero_image === "object" && !Array.isArray(r.hero_image)) {
    const img = r.hero_image as Record<string, unknown>;
    if (typeof img.url === "string") {
      result.hero_image = {
        url: img.url,
        alt: typeof img.alt === "string" ? img.alt : undefined,
        width: typeof img.width === "number" ? img.width : undefined,
        height: typeof img.height === "number" ? img.height : undefined,
      };
    }
  }
  if (typeof r.start_year === "number") result.start_year = r.start_year;
  if (typeof r.end_year === "number") result.end_year = r.end_year;
  if (typeof r.original_author === "string") result.original_author = r.original_author;
  if (typeof r.production_company === "string") result.production_company = r.production_company;
  if (typeof r.featured_post === "number") result.featured_post = r.featured_post;
  if (r.display_order === "asc" || r.display_order === "desc") result.display_order = r.display_order;
  if (typeof r.show_timeline === "boolean") result.show_timeline = r.show_timeline;
  if (typeof r.show_score === "boolean") result.show_score = r.show_score;

  if (Array.isArray(r.timeline_text)) {
    result.timeline_text = r.timeline_text
      .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
      .map((e) => ({ year: String(e.year ?? ""), content: String(e.content ?? "") }));
  }
  if (Array.isArray(r.highlights)) {
    result.highlights = r.highlights
      .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
      .map((e) => ({ title: String(e.title ?? ""), description: String(e.description ?? "") }));
  }
  if (Array.isArray(r.related_links)) {
    result.related_links = r.related_links
      .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
      .map((e) => ({ label: String(e.label ?? ""), url: String(e.url ?? "") }));
  }

  return result;
};

/** franchise ターム配列を `WPFranchiseTerm[]` に変換する。 */
const parseFranchiseList = (data: unknown): WPFranchiseTerm[] => {
  if (!Array.isArray(data)) return [];
  return data.flatMap((item) => {
    const term = toWPFranchiseTerm(item);
    return term ? [term] : [];
  });
};

/** 先頭ページ（最大 100 件）の franchise 一覧を生 `fetch` で取得する。 */
const fetchFranchises = async (options?: WpFetchOptions): Promise<WPFranchiseTerm[] | null> => {
  if (!wpApiBaseUrl) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const u = new URL(`${wpApiBaseUrl}/${FRANCHISE_REST_PATH}`);
      u.searchParams.set("per_page", "100");
      u.searchParams.set("_embed", "1");
      u.searchParams.set("acf_format", "standard");
      const res = await fetch(u.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      return parseFranchiseList(await res.json());
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

/** スラッグで franchise ターム 1 件を直接取得する。 */
const fetchFranchiseTermBySlug = async (
  slug: string,
  options?: WpFetchOptions,
): Promise<WPFranchiseTerm | null> => {
  if (!wpApiBaseUrl) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const u = new URL(`${wpApiBaseUrl}/${FRANCHISE_REST_PATH}`);
      u.searchParams.set("slug", slug);
      u.searchParams.set("per_page", "1");
      u.searchParams.set("_embed", "1");
      u.searchParams.set("acf_format", "standard");
      const res = await fetch(u.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const list = parseFranchiseList(await res.json());
      return list[0] ?? null;
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

/** `WPFranchiseTerm` をアプリの `Franchise` 型へ変換する（投稿一覧は呼び出し側で注入）。 */
export const transformFranchise = (
  term: WPFranchiseTerm,
  posts: import("@/types/post").Post[] = [],
): import("@/types/franchise").Franchise => {
  const acf = term.acf ?? {};
  const heroImg = acf.hero_image;
  return {
    id: term.id,
    slug: term.slug,
    title: acf.title_override?.trim() || term.name,
    description: acf.description ?? "",
    catchCopy: acf.catch_copy ?? "",
    heroImage:
      heroImg && typeof heroImg === "object"
        ? {
            url: heroImg.url,
            alt: heroImg.alt ?? term.name,
            width: heroImg.width ?? 0,
            height: heroImg.height ?? 0,
          }
        : null,
    startYear: acf.start_year ?? null,
    endYear: acf.end_year ?? null,
    originalAuthor: acf.original_author ?? "",
    productionCompany: acf.production_company ?? "",
    displayOrder: acf.display_order ?? "desc",
    showTimeline: acf.show_timeline ?? false,
    showScore: acf.show_score ?? false,
    timeline: acf.timeline_text ?? [],
    highlights: acf.highlights ?? [],
    relatedLinks: acf.related_links ?? [],
    posts,
  };
};

/** 利用可能な franchise ターム一覧。失敗時は空配列。 */
export const getFranchises = async (options?: WpFetchOptions): Promise<WPFranchiseTerm[]> =>
  (await fetchFranchises(options)) ?? [];

/** 投稿 ID に紐付く franchise タームを取得する。失敗時は空配列。 */
export const getFranchiseTermsByPostId = async (
  postId: number,
  options?: WpFetchOptions,
): Promise<WPFranchiseTerm[]> => {
  if (!wpApiBaseUrl) return [];
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const u = new URL(`${wpApiBaseUrl}/${FRANCHISE_REST_PATH}`);
      u.searchParams.set("post", String(postId));
      u.searchParams.set("per_page", "100");
      u.searchParams.set("acf_format", "standard");
      const res = await fetch(u.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return [];
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      return parseFranchiseList(await res.json());
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return [];
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return [];
};

/** ISR 静的パス生成用に全 franchise スラッグを返す。失敗時は空配列。 */
export const getAllFranchiseSlugs = async (options?: WpFetchOptions): Promise<string[]> => {
  const terms = await getFranchises(options);
  return terms.map((t) => t.slug);
};

/** スラッグで franchise タームを解決する。見つからない場合は `null`。 */
export const getFranchiseBySlug = async (
  slug: string,
  options?: WpFetchOptions,
): Promise<WPFranchiseTerm | null> => {
  const trimmed = slug.trim();
  if (!trimmed) return null;
  return fetchFranchiseTermBySlug(trimmed, options);
};
