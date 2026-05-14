/**
 * CPT `person`（人物）の REST エンドポイントラッパー。
 * WP_PERSON_REST_PATH で指定したコレクション（デフォルト `person`）に対して
 * 生 fetch で取得し、`mapWPPersonToPerson` で正規化して返す。
 */
import { WP_PERSON_REST_PATH } from "@/config/wpContent.config";
import {
  wpApiBaseUrl,
  defaultFetchOptions,
  sleep,
  shouldRetryStatus,
} from "../client";
import type { WpFetchOptions } from "../client";
import { mapWPPersonToPerson } from "../transform";
import type { Person, PersonRole } from "@/types/entity";

/** CPT person の REST コレクションパス（前後スラッシュを除去）。 */
const personCollectionPath = (): string => {
  const raw = WP_PERSON_REST_PATH.trim();
  return raw ? raw.replace(/^\/+|\/+$/g, "") : "person";
};

/** WP REST レスポンスの配列を `Person[]` に変換する。 */
const parsePersonList = (data: unknown): Person[] => {
  if (!Array.isArray(data)) return [];
  const out: Person[] = [];
  for (const item of data) {
    const p = mapWPPersonToPerson(item);
    if (p) out.push(p);
  }
  return out;
};

/** person コレクションを生 fetch で取得する汎用関数。 */
const fetchPersons = async (
  params: URLSearchParams,
  options?: WpFetchOptions,
): Promise<Person[] | null> => {
  if (!wpApiBaseUrl) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const url = `${wpApiBaseUrl}/${personCollectionPath()}?${params.toString()}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const json: unknown = await res.json();
      return parsePersonList(json);
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

/** 共通クエリパラメータを組み立てる。 */
const baseParams = (lang?: string): URLSearchParams => {
  const sp = new URLSearchParams();
  sp.set("_embed", "1");
  sp.set("acf_format", "standard");
  if (lang) sp.set("lang", lang);
  return sp;
};

/** ID で person 1 件を取得する。見つからない場合は `null`。 */
export const getPerson = async (
  id: number,
  lang?: string,
  options?: WpFetchOptions,
): Promise<Person | null> => {
  if (!wpApiBaseUrl) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  const sp = baseParams(lang);
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const url = `${wpApiBaseUrl}/${personCollectionPath()}/${id}?${sp.toString()}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const json: unknown = await res.json();
      return mapWPPersonToPerson(json);
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

/** スラッグで person 1 件を取得する。見つからない場合は `null`。 */
export const getPersonBySlug = async (
  slug: string,
  lang?: string,
  options?: WpFetchOptions,
): Promise<Person | null> => {
  const trimmed = slug.trim();
  if (!trimmed) return null;
  const sp = baseParams(lang);
  sp.set("slug", trimmed);
  sp.set("per_page", "1");
  const list = await fetchPersons(sp, options);
  if (list && list.length > 0) return list[0] ?? null;
  if (lang) {
    const sp2 = baseParams();
    sp2.set("slug", trimmed);
    sp2.set("per_page", "1");
    return (await fetchPersons(sp2, options))?.[0] ?? null;
  }
  return null;
};

/**
 * 指定ロール（`actor` / `director`）の person 一覧を返す。
 * WP 側で ACF `roles` フィールドが設定済みの場合、`?roles={role}` で絞り込む。
 * フィルタが効かない環境では全件取得後にクライアント側で絞る。
 */
export const getPersonsByRole = async (
  role: PersonRole,
  lang?: string,
  options?: WpFetchOptions,
): Promise<Person[]> => {
  const sp = baseParams(lang);
  sp.set("per_page", "100");
  sp.set("roles", role);
  const list = await fetchPersons(sp, options);
  if (list) {
    const filtered = list.filter((p) => p.roles.includes(role));
    if (filtered.length > 0) return filtered;
  }
  const fallbackSp = baseParams(lang);
  fallbackSp.set("per_page", "100");
  const all = (await fetchPersons(fallbackSp, options)) ?? [];
  return all.filter((p) => p.roles.includes(role));
};

/** person 全件一覧（最大 100 件）。失敗時は空配列。 */
export const getPersons = async (
  lang?: string,
  options?: WpFetchOptions,
): Promise<Person[]> => {
  const sp = baseParams(lang);
  sp.set("per_page", "100");
  return (await fetchPersons(sp, options)) ?? [];
};
