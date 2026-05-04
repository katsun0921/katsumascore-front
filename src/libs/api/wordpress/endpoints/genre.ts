/**
 * カスタムタクソノミー `genre` の一覧・スラッグ検索・表示ラベル解決。
 */
import {
  wpApiBaseUrl,
  defaultFetchOptions,
  sleep,
  shouldRetryStatus,
} from "../client";
import type { WpFetchOptions } from "../client";

/** WP 登録の `rest_base` が `genre` 以外のとき `WP_GENRE_REST_PATH` で指定（例: `genres`） */
const genreRestCollectionPath = (): string => {
  const raw = process.env.WP_GENRE_REST_PATH?.trim();
  if (raw && /^[a-z0-9-]+$/i.test(raw)) return raw.replace(/^\/+|\/+$/g, "");
  return "genre";
};

export type WPGenreTerm = {
  id: number;
  slug: string;
  name: string;
  count: number;
  /** REST の `name_ja` / `name_en` を正規化（locale キーは `ja` / `en`） */
  acf?: { ja?: string; en?: string };
};

/** オブジェクトから、最初に見つかった非空文字列を返す。 */
const pickFirstString = (r: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v.trim() !== "") return v.trim();
  }
  return undefined;
};

/**
 * genre タームの REST に載る ACF を正規化する。
 * - WP 側フィールド名は `name_ja` / `name_en` のまま読む
 * - 未設定や古いデータでは `acf: false` / 空オブジェクト のことがある
 */
export const normalizeGenreTermAcf = (
  acfRaw: unknown,
): { ja?: string; en?: string } | undefined => {
  if (acfRaw === false || acfRaw === null || acfRaw === undefined) return undefined;
  if (typeof acfRaw !== "object" || Array.isArray(acfRaw)) return undefined;
  const r = acfRaw as Record<string, unknown>;
  const primary = pickFirstString(r, ["name_ja", "genre_name_ja"]);
  const alternate = pickFirstString(r, ["name_en", "genre_name_en"]);
  if (primary === undefined && alternate === undefined) return undefined;
  return { ...(primary !== undefined ? { ja: primary } : {}), ...(alternate !== undefined ? { en: alternate } : {}) };
};

/** WP / プラグインにより数値が文字列で返る場合を吸収し、有限整数にする。 */
const coerceFiniteInt = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && /^\d+$/.test(v.trim())) return Number.parseInt(v.trim(), 10);
  return null;
};

/** REST の `name` が文字列または `{ rendered }` のとき表示名を取り出す。 */
const termNameString = (raw: unknown): string | null => {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "rendered" in raw) {
    const r = (raw as { rendered: unknown }).rendered;
    if (typeof r === "string") return r;
  }
  return null;
};

/** 厳密にパースして `WPGenreTerm` を組み立てる。必須フィールドが欠ける場合は `null`。 */
const toWPGenreTerm = (x: unknown): WPGenreTerm | null => {
  if (typeof x !== "object" || x === null) return null;
  const o = x as Record<string, unknown>;
  const id = coerceFiniteInt(o.id);
  if (id === null) return null;
  if (typeof o.slug !== "string") return null;
  const name = termNameString(o.name);
  if (name === null) return null;
  const countRaw = coerceFiniteInt(o.count);
  const count = countRaw !== null ? countRaw : 0;
  const acf = normalizeGenreTermAcf(o.acf);
  return {
    id,
    slug: o.slug,
    name,
    count,
    ...(acf !== undefined ? { acf } : {}),
  };
};

/**
 * 厳密パースで落ちる term（name 形状差など）を一覧・slug 検索で拾う。
 * `id` が取れれば投稿一覧は `genre={id}` で絞れる。
 */
const toWPGenreTermLenient = (item: unknown, requestedSlug?: string): WPGenreTerm | null => {
  if (typeof item !== "object" || item === null) return null;
  const o = item as Record<string, unknown>;
  const id = coerceFiniteInt(o.id);
  if (id === null) return null;
  let slugVal: string;
  if (typeof o.slug === "string" && o.slug.trim()) {
    slugVal = o.slug.trim();
  } else if (requestedSlug !== undefined && requestedSlug.trim()) {
    slugVal = requestedSlug.trim();
  } else {
    return null;
  }
  const nameVal = termNameString(o.name) ?? slugVal;
  const countRaw = coerceFiniteInt(o.count);
  const count = countRaw !== null ? countRaw : 0;
  const acf = normalizeGenreTermAcf(o.acf);
  return {
    id,
    slug: slugVal,
    name: nameVal,
    count,
    ...(acf !== undefined ? { acf } : {}),
  };
};

/** REST の配列レスポンスを `WPGenreTerm[]` に変換する（厳密＋寛容パスの両方）。 */
const parseGenreList = (data: unknown): WPGenreTerm[] => {
  if (!Array.isArray(data)) return [];
  const out: WPGenreTerm[] = [];
  for (const item of data) {
    const strict = toWPGenreTerm(item);
    if (strict) {
      out.push(strict);
      continue;
    }
    const lenient = toWPGenreTermLenient(item);
    if (lenient) out.push(lenient);
  }
  return out;
};

/** ロケールに応じて ACF の多言語名または REST の `name` を選ぶ。 */
export const genreDisplayLabel = (term: WPGenreTerm, locale: string): string => {
  const acf = term.acf;
  if (locale === "en") {
    if (acf?.en) return acf.en;
    if (acf?.ja) return acf.ja;
    return term.name;
  }
  if (acf?.ja) return acf.ja;
  return term.name;
};

/** genre コレクションの 1 ページを生 `fetch` で取得する。 */
const fetchGenresPage = async (
  pageNum: number,
  perPage: number,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPGenreTerm[] | null> => {
  if (!wpApiBaseUrl) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const u = new URL(`${wpApiBaseUrl}/${genreRestCollectionPath()}`);
      u.searchParams.set("page", String(pageNum));
      u.searchParams.set("per_page", String(perPage));
      u.searchParams.set("_embed", "1");
      u.searchParams.set("acf_format", "standard");
      if (lang) u.searchParams.set("lang", lang);
      const res = await fetch(u.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const json: unknown = await res.json();
      return parseGenreList(json);
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

/** 先頭ページ（最大 100 件）の genre 一覧。 */
const fetchGenres = async (lang?: string, options?: WpFetchOptions): Promise<WPGenreTerm[] | null> =>
  fetchGenresPage(1, 100, lang, options);

/** 利用可能な genre ターム一覧。失敗時は空配列。 */
export const getGenres = async (lang?: string, options?: WpFetchOptions): Promise<WPGenreTerm[]> =>
  (await fetchGenres(lang, options)) ?? [];

/** 一覧が 100 件を超える場合にページを進めてスラッグ一致を探す。 */
const findGenreBySlugPaginated = async (
  slug: string,
  lang: string | undefined,
  options: WpFetchOptions | undefined,
  maxPages: number,
): Promise<WPGenreTerm | null> => {
  const perPage = 100;
  for (let pageNum = 1; pageNum <= maxPages; pageNum += 1) {
    const list = await fetchGenresPage(pageNum, perPage, lang, options);
    if (!list) return null;
    const found = list.find((g) => g.slug === slug);
    if (found) return found;
    if (list.length < perPage) break;
  }
  return null;
};

/**
 * `slug` で直接 REST 解決する（`getGenres` は最大100件のため、それ以降のタームが一覧に載らない問題を避ける）
 */
const fetchGenreTermBySlug = async (
  slug: string,
  lang: string | undefined,
  options: WpFetchOptions | undefined,
): Promise<WPGenreTerm | null> => {
  if (!wpApiBaseUrl) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const u = new URL(`${wpApiBaseUrl}/${genreRestCollectionPath()}`);
      u.searchParams.set("slug", slug);
      u.searchParams.set("per_page", "1");
      u.searchParams.set("_embed", "1");
      u.searchParams.set("acf_format", "standard");
      if (lang) u.searchParams.set("lang", lang);
      const res = await fetch(u.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const json: unknown = await res.json();
      const list = parseGenreList(json);
      if (list.length > 0) return list[0] ?? null;
      if (Array.isArray(json) && json.length > 0) {
        const loose = toWPGenreTermLenient(json[0], slug);
        if (loose) return loose;
      }
      return null;
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

/**
 * スラッグで genre タームを解決する。
 * 直接 REST → 言語フォールバック → 全件一覧 → ページネーションの順で試す。
 */
export const getGenreBySlug = async (
  slug: string,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPGenreTerm | null> => {
  const trimmed = slug.trim();
  if (!trimmed) return null;
  let direct = await fetchGenreTermBySlug(trimmed, lang, options);
  if (direct) return direct;
  if (lang) {
    direct = await fetchGenreTermBySlug(trimmed, undefined, options);
    if (direct) return direct;
  }
  let genres = await getGenres(lang, options);
  let found = genres.find((g) => g.slug === trimmed);
  if (found) return found;
  if (lang) {
    genres = await getGenres(undefined, options);
    found = genres.find((g) => g.slug === trimmed);
    if (found) return found;
  }
  let paged = await findGenreBySlugPaginated(trimmed, lang, options, 20);
  if (paged) return paged;
  if (lang) {
    paged = await findGenreBySlugPaginated(trimmed, undefined, options, 20);
    if (paged) return paged;
  }
  return null;
};
