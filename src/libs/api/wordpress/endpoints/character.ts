/**
 * カスタムタクソノミー `character` の一覧・スラッグ検索・ターム取得。
 */
import {
  wpApiBaseUrl,
  defaultFetchOptions,
  sleep,
  shouldRetryStatus,
} from "../client";
import type { WpFetchOptions } from "../client";
import type { Character } from "@/types/character";

/** character REST コレクション名（WP 側の `rest_base`）。 */
const CHARACTER_REST_PATH = "character";

type WPCharacterTerm = {
  id: number;
  slug: string;
  name: string;
  parent: number;
};

/** 生 REST レスポンスから `WPCharacterTerm` を組み立てる。必須フィールドが欠ける場合は `null`。 */
const toWPCharacterTerm = (x: unknown): WPCharacterTerm | null => {
  if (typeof x !== "object" || x === null) return null;
  const o = x as Record<string, unknown>;
  const id = typeof o.id === "number" ? o.id : null;
  if (id === null) return null;
  if (typeof o.slug !== "string") return null;
  if (typeof o.name !== "string") return null;
  const parent = typeof o.parent === "number" ? o.parent : 0;
  return { id, slug: o.slug, name: o.name, parent };
};

/** `WPCharacterTerm` を `Character` 型へ変換する。 */
const toCharacter = (term: WPCharacterTerm, allTerms: WPCharacterTerm[]): Character => {
  const parentTerm = term.parent !== 0 ? allTerms.find((t) => t.id === term.parent) : undefined;
  return {
    id: term.id,
    slug: term.slug,
    name: term.name,
    parent: term.parent,
    ...(parentTerm ? { parentSlug: parentTerm.slug } : {}),
  };
};

/** character ターム配列を `WPCharacterTerm[]` に変換する。 */
const parseCharacterList = (data: unknown): WPCharacterTerm[] => {
  if (!Array.isArray(data)) return [];
  return data.flatMap((item) => {
    const term = toWPCharacterTerm(item);
    return term ? [term] : [];
  });
};

/** 先頭ページ（最大 100 件）の character タームを生 `fetch` で取得する。 */
const fetchCharacterTerms = async (options?: WpFetchOptions): Promise<WPCharacterTerm[] | null> => {
  if (!wpApiBaseUrl) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const u = new URL(`${wpApiBaseUrl}/${CHARACTER_REST_PATH}`);
      u.searchParams.set("per_page", "100");
      u.searchParams.set("_fields", "id,slug,name,parent,link");
      const res = await fetch(u.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      return parseCharacterList(await res.json());
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

/** スラッグで character ターム 1 件を取得する。 */
const fetchCharacterTermBySlug = async (
  slug: string,
  options?: WpFetchOptions,
): Promise<WPCharacterTerm | null> => {
  if (!wpApiBaseUrl) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const u = new URL(`${wpApiBaseUrl}/${CHARACTER_REST_PATH}`);
      u.searchParams.set("slug", slug);
      u.searchParams.set("per_page", "1");
      u.searchParams.set("_fields", "id,slug,name,parent,link");
      const res = await fetch(u.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const list = parseCharacterList(await res.json());
      return list[0] ?? null;
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

/** 全 character ターム一覧（子ターム含む）。失敗時は空配列。 */
export const getAllCharacterTerms = async (options?: WpFetchOptions): Promise<Character[]> => {
  const rawTerms = (await fetchCharacterTerms(options)) ?? [];
  return rawTerms.map((t) => toCharacter(t, rawTerms));
};

/** ISR 静的パス生成用に子タームのスラッグ一覧を返す（parent !== 0 のみ）。失敗時は空配列。 */
export const getAllCharacterSlugs = async (options?: WpFetchOptions): Promise<string[]> => {
  const rawTerms = (await fetchCharacterTerms(options)) ?? [];
  return rawTerms.filter((t) => t.parent !== 0).map((t) => t.slug);
};

/** スラッグで character タームを解決する。見つからない場合は `null`。 */
export const getCharacterBySlug = async (
  slug: string,
  options?: WpFetchOptions,
): Promise<Character | null> => {
  const trimmed = slug.trim();
  if (!trimmed) return null;
  const rawTerms = (await fetchCharacterTerms(options)) ?? [];
  const raw = rawTerms.find((t) => t.slug === trimmed) ?? (await fetchCharacterTermBySlug(trimmed, options));
  if (!raw) return null;
  return toCharacter(raw, rawTerms);
};

/** term_id で character ターム（スラッグ・名前）を解決する。キャラクターリンク表示に使用。 */
export const getCharacterSlugById = async (
  termId: number,
  options?: WpFetchOptions,
): Promise<{ id: number; slug: string; name: string } | null> => {
  const rawTerms = (await fetchCharacterTerms(options)) ?? [];
  const found = rawTerms.find((t) => t.id === termId);
  if (!found) return null;
  return { id: found.id, slug: found.slug, name: found.name };
};
