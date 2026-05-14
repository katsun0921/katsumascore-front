/**
 * CPT `company`（企業）の REST エンドポイントラッパー。
 * WP_COMPANY_REST_PATH で指定したコレクション（デフォルト `company`）に対して
 * 生 fetch で取得し、`mapWPCompanyToCompany` で正規化して返す。
 */
import { WP_COMPANY_REST_PATH } from "@/config/wpContent.config";
import {
  wpApiBaseUrl,
  defaultFetchOptions,
  sleep,
  shouldRetryStatus,
} from "../client";
import type { WpFetchOptions } from "../client";
import { mapWPCompanyToCompany } from "../transform";
import type { Company, CompanyRole } from "@/types/entity";

/** CPT company の REST コレクションパス（前後スラッシュを除去）。 */
const companyCollectionPath = (): string => {
  const raw = WP_COMPANY_REST_PATH.trim();
  return raw ? raw.replace(/^\/+|\/+$/g, "") : "company";
};

/** WP REST レスポンスの配列を `Company[]` に変換する。 */
const parseCompanyList = (data: unknown): Company[] => {
  if (!Array.isArray(data)) return [];
  const out: Company[] = [];
  for (const item of data) {
    const c = mapWPCompanyToCompany(item);
    if (c) out.push(c);
  }
  return out;
};

/** company コレクションを生 fetch で取得する汎用関数。 */
const fetchCompanies = async (
  params: URLSearchParams,
  options?: WpFetchOptions,
): Promise<Company[] | null> => {
  if (!wpApiBaseUrl) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const url = `${wpApiBaseUrl}/${companyCollectionPath()}?${params.toString()}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const json: unknown = await res.json();
      return parseCompanyList(json);
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

/** ID で company 1 件を取得する。見つからない場合は `null`。 */
export const getCompany = async (
  id: number,
  lang?: string,
  options?: WpFetchOptions,
): Promise<Company | null> => {
  if (!wpApiBaseUrl) return null;
  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultFetchOptions, ...options };
  const sp = baseParams(lang);
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const url = `${wpApiBaseUrl}/${companyCollectionPath()}/${id}?${sp.toString()}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const json: unknown = await res.json();
      return mapWPCompanyToCompany(json);
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};

/** スラッグで company 1 件を取得する。見つからない場合は `null`。 */
export const getCompanyBySlug = async (
  slug: string,
  lang?: string,
  options?: WpFetchOptions,
): Promise<Company | null> => {
  const trimmed = slug.trim();
  if (!trimmed) return null;
  const sp = baseParams(lang);
  sp.set("slug", trimmed);
  sp.set("per_page", "1");
  const list = await fetchCompanies(sp, options);
  if (list && list.length > 0) return list[0] ?? null;
  if (lang) {
    const sp2 = baseParams();
    sp2.set("slug", trimmed);
    sp2.set("per_page", "1");
    return (await fetchCompanies(sp2, options))?.[0] ?? null;
  }
  return null;
};

/**
 * 指定ロール（`production` / `distributor`）の company 一覧を返す。
 * WP 側で ACF `roles` フィールドが設定済みの場合、`?roles={role}` で絞り込む。
 * フィルタが効かない環境では全件取得後にクライアント側で絞る。
 */
export const getCompaniesByRole = async (
  role: CompanyRole,
  lang?: string,
  options?: WpFetchOptions,
): Promise<Company[]> => {
  const sp = baseParams(lang);
  sp.set("per_page", "100");
  sp.set("roles", role);
  const list = await fetchCompanies(sp, options);
  if (list) {
    const filtered = list.filter((c) => c.roles.includes(role));
    if (filtered.length > 0) return filtered;
  }
  const fallbackSp = baseParams(lang);
  fallbackSp.set("per_page", "100");
  const all = (await fetchCompanies(fallbackSp, options)) ?? [];
  return all.filter((c) => c.roles.includes(role));
};

/** company 全件一覧（最大 100 件）。失敗時は空配列。 */
export const getCompanies = async (
  lang?: string,
  options?: WpFetchOptions,
): Promise<Company[]> => {
  const sp = baseParams(lang);
  sp.set("per_page", "100");
  return (await fetchCompanies(sp, options)) ?? [];
};
