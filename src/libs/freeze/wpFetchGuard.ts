/**
 * SSG 凍結ビルド専用の WordPress 取得ガード。
 *
 * ConoHa への負荷を抑え、取得失敗のまま空データをデプロイしないために `globalThis.fetch` を差し替える。
 * - 同時リクエスト数を制限する
 * - 一時的な 5xx / 429 / ネットワークエラーを指数バックオフで再試行する
 * - 同一 URL の GET をプロセス内でキャッシュする
 * - 再試行しても失敗したらビルドを失敗させる（`process.exit(1)`）
 *
 * ビルド中（`NEXT_PHASE=phase-production-build`）かつ `NEXT_PUBLIC_SSG_FREEZE=1` のときだけ有効。
 * 既存のエンドポイント関数は失敗を `null` / 空配列に丸めるため、例外では止まらない。
 */
import { isSsgFreeze } from './ssgFreeze';

const MAX_CONCURRENCY = 4;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;
const TIMEOUT_MS = 60_000;
const CACHE_LIMIT_BYTES = 256 * 1024 * 1024;

type CachedResponse = {
  status: number;
  statusText: string;
  headers: [string, string][];
  body: string;
};

const cache = new Map<string, Promise<CachedResponse>>();
let cachedBytes = 0;
let installed = false;
let active = 0;
const waiters: (() => void)[] = [];

/** 同時実行数の枠が空くまで待つ。 */
const acquire = async (): Promise<void> => {
  if (active < MAX_CONCURRENCY) {
    active += 1;
    return;
  }
  await new Promise<void>((resolve) => waiters.push(resolve));
  active += 1;
};

/** 同時実行数の枠を返し、待機中のリクエストを 1 件進める。 */
const release = (): void => {
  active -= 1;
  waiters.shift()?.();
};

/** 再試行しても解消しない失敗か（5xx / 429 / 401 / 403）。 */
const isFatalStatus = (status: number): boolean => status >= 500 || status === 429 || status === 401 || status === 403;

/** ビルドを失敗させる。空データのままのデプロイを防ぐための最終手段。 */
const failBuild = (url: string, reason: string): never => {
  console.error(`[ssg-freeze] WordPress の取得に失敗したためビルドを中止します: ${reason} (${url})`);
  process.exit(1);
};

/** 待機（再試行の間隔用）。 */
const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/** 1 URL を再試行付きで取得し、本文を文字列で保持する。失敗が確定したらビルドを失敗させる。 */
const fetchWithRetry = async (
  original: typeof fetch,
  url: string,
  headers: HeadersInit | undefined,
): Promise<CachedResponse> => {
  let lastReason = '';
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    await acquire();
    try {
      const res = await original(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!isFatalStatus(res.status)) {
        return {
          status: res.status,
          statusText: res.statusText,
          headers: [...res.headers.entries()],
          body: await res.text(),
        };
      }
      await res.body?.cancel();
      lastReason = `HTTP ${res.status}`;
    } catch (e) {
      lastReason = e instanceof Error ? e.message : String(e);
    } finally {
      release();
    }
    // 401 / 403 は再試行しても解消しないため即失敗にする
    if (/HTTP (401|403)$/.test(lastReason)) break;
    if (attempt < MAX_RETRIES) await wait(INITIAL_BACKOFF_MS * 2 ** attempt);
  }
  return failBuild(url, lastReason);
};

/** キャッシュ済みの内容から新しい `Response` を作る（本文は 1 回しか読めないため毎回生成する）。 */
const toResponse = (c: CachedResponse): Response => {
  const nullBody = c.status === 204 || c.status === 205 || c.status === 304;
  return new Response(nullBody ? null : c.body, { status: c.status, statusText: c.statusText, headers: c.headers });
};

/** 入力（文字列 / URL / Request）から URL 文字列を取り出す。 */
const resolveUrl = (input: RequestInfo | URL): string => {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
};

/**
 * 凍結ビルド中だけ `fetch` を差し替える。複数回呼んでも 1 度しか差し替えない。
 *
 * @param baseUrl WordPress REST のベース URL（このオリジン宛の GET のみ対象）
 */
export const installWpFetchGuard = (baseUrl: string | undefined): void => {
  if (installed || !baseUrl) return;
  if (!isSsgFreeze() || process.env.NEXT_PHASE !== 'phase-production-build') return;
  installed = true;

  const origin = new URL(baseUrl).origin;
  const original = globalThis.fetch;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = resolveUrl(input);
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    if (method !== 'GET' || !url.startsWith(origin)) return original(input, init);

    const headers = init?.headers ?? (input instanceof Request ? input.headers : undefined);
    let entry = cache.get(url);
    if (!entry) {
      entry = fetchWithRetry(original, url, headers).then((c) => {
        cachedBytes += c.body.length;
        // 上限を超えたら以降はキャッシュしない（同一 URL の再取得は許容する）
        if (cachedBytes > CACHE_LIMIT_BYTES) cache.delete(url);
        return c;
      });
      cache.set(url, entry);
    }
    return toResponse(await entry);
  };
};
