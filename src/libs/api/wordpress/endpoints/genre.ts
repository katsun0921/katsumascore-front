import {
  wpApiBaseUrl,
  defaultFetchOptions,
  sleep,
  shouldRetryStatus,
} from "../client";
import type { WpFetchOptions } from "../client";

export type WPGenreTerm = {
  id: number;
  slug: string;
  name: string;
  count: number;
  /** REST の `name_ja` / `name_en` を正規化（locale キーは `ja` / `en`） */
  acf?: { ja?: string; en?: string };
};

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

const isGenreTermShape = (x: unknown): x is Omit<WPGenreTerm, "acf"> & { acf?: unknown } => {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "number" &&
    typeof o.slug === "string" &&
    typeof o.name === "string" &&
    typeof o.count === "number"
  );
};

const toWPGenreTerm = (x: unknown): WPGenreTerm | null => {
  if (!isGenreTermShape(x)) return null;
  const o = x as Record<string, unknown>;
  const acf = normalizeGenreTermAcf(o.acf);
  return {
    id: o.id as number,
    slug: o.slug as string,
    name: o.name as string,
    count: o.count as number,
    ...(acf !== undefined ? { acf } : {}),
  };
};

const parseGenreList = (data: unknown): WPGenreTerm[] => {
  if (!Array.isArray(data)) return [];
  return data.map(toWPGenreTerm).filter((t): t is WPGenreTerm => t !== null);
};

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

const fetchGenres = async (
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPGenreTerm[] | null> => {
  if (!wpApiBaseUrl) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const u = new URL(`${wpApiBaseUrl}/genre`);
      u.searchParams.set("per_page", "100");
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

export const getGenres = async (lang?: string, options?: WpFetchOptions): Promise<WPGenreTerm[]> =>
  (await fetchGenres(lang, options)) ?? [];

export const getGenreBySlug = async (
  slug: string,
  lang?: string,
  options?: WpFetchOptions,
): Promise<WPGenreTerm | null> => {
  const genres = await getGenres(lang, options);
  return genres.find((g) => g.slug === slug) ?? null;
};
