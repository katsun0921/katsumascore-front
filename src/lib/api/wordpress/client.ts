const normalizeWpApiBaseUrl = (raw: string | undefined): string | undefined => {
  const t = raw?.trim();
  if (!t) return undefined;
  return t.replace(/\/+$/, "");
};

export const BASE_URL = normalizeWpApiBaseUrl(process.env.WP_API_URL);

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export type WpFetchOptions = {
  timeoutMs?: number;
  maxRetries?: number;
  initialBackoffMs?: number;
};

const defaultOptions: Required<WpFetchOptions> = {
  timeoutMs: 3000,
  maxRetries: 2,
  initialBackoffMs: 500,
};

const shouldRetryStatus = (status: number) => status === 429 || status >= 500;

/** `_embed` / `acf_format` を既定値として付与し、`_fields` があれば追加する */
const buildUrl = (
  path: string,
  params: Record<string, string | number>,
): string => {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("_embed", "1");
  url.searchParams.set("acf_format", "standard");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  return url.toString();
};

/** Body のみ返す汎用フェッチ */
export const wpFetch = async <T>(
  path: string,
  params: Record<string, string | number> = {},
  options?: WpFetchOptions,
): Promise<T | null> => {
  if (!BASE_URL) return null;

  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultOptions, ...options };
  const urlString = buildUrl(path, params);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(urlString, { signal: controller.signal });
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

export type WpPostsListMeta = {
  total: number;
  totalPages: number;
};

export type WpPostsPagedResult<T> = {
  items: T[];
  meta: WpPostsListMeta;
};

/** ページネーション用: X-WP-Total / X-WP-TotalPages ヘッダ込みで返す */
export const wpFetchWithMeta = async <T>(
  path: string,
  params: Record<string, string | number> = {},
  options?: WpFetchOptions,
): Promise<WpPostsPagedResult<T> | null> => {
  if (!BASE_URL) return null;

  const { timeoutMs, maxRetries, initialBackoffMs } = { ...defaultOptions, ...options };
  const urlString = buildUrl(path, params);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(urlString, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (!shouldRetryStatus(res.status) || attempt === maxRetries) return null;
        await sleep(initialBackoffMs * 2 ** attempt);
        continue;
      }
      const total = Number.parseInt(res.headers.get("X-WP-Total") ?? "0", 10) || 0;
      const totalPages = Number.parseInt(res.headers.get("X-WP-TotalPages") ?? "1", 10) || 1;
      const items = (await res.json()) as T[];
      return { items, meta: { total, totalPages } };
    } catch {
      clearTimeout(timeoutId);
      if (attempt === maxRetries) return null;
      await sleep(initialBackoffMs * 2 ** attempt);
    }
  }
  return null;
};
