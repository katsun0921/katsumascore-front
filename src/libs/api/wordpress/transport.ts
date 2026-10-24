/** WordPress 専用の通信入口。ビルド中だけ再試行・同時実行制限・成功レスポンスの共有を行い、実行時は呼び出し元の設定に従う。 */
import { createWpResponseCache } from './responseCache';
import type { BufferedWpResponse } from './responseCache';

let activeRequests = 0;
const waiting: (() => void)[] = [];
const buildResponses = createWpResponseCache();

/** 通信障害を投稿の不存在と区別するエラー。URL・ヘッダー・トークンは含めない。 */
export class WpRequestError extends Error {
  /** HTTPステータスだけを安全に診断へ渡す。 */
  constructor(status?: number) {
    super(`WordPress request failed${status ? ` (HTTP ${status})` : ''}`);
    this.name = 'WpRequestError';
  }
}

/** トークン登録済みのNextビルドだけ取得失敗を致命的とする。実行時や未設定ビルドは従来の復旧処理を使う。 */
export const isStrictWpBuild = (): boolean =>
  process.env.WP_SSG_BUILD === '1' && Boolean(process.env.WP_BUILD_TOKEN?.trim());

/** 指定済みWPへ送るヘッダー。トークンがある環境だけ秘密ヘッダーを付ける。 */
const withBuildToken = (request: Request): Headers => {
  const headers = new Headers(request.headers);
  const token = process.env.WP_BUILD_TOKEN?.trim();
  if (token) headers.set('x-build-token', token);
  return headers;
};

/** 待機中リクエストへ実行権を渡す。実行中はプロセスあたり最大4件。 */
const acquire = async (): Promise<void> => {
  if (activeRequests < 4) {
    activeRequests += 1;
    return;
  }
  await new Promise<void>((resolve) => waiting.push(resolve));
};

/** スロットを次の待機者へ移譲し、待機者がなければ解放する。 */
const release = (): void => {
  const next = waiting.shift();
  if (next) next();
  else activeRequests -= 1;
};

/** ビルド専用。呼び出し元の短いタイムアウトとは独立して、本文読了まで制限・最大3回再試行する。 */
const requestWordPress = async (request: Request): Promise<BufferedWpResponse> => {
  for (let attempt = 0; attempt <= 3; attempt += 1) {
    await acquire();
    let retry = false;
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: withBuildToken(request),
        redirect: 'error',
        signal: AbortSignal.timeout(30_000),
      });
      // 本文を読み終えるまでスロットを保持する。キャッシュ/利用者間でbodyを共有しない。
      const body = await response.arrayBuffer();
      retry = response.status === 429 || response.status >= 500;
      if (!retry) {
        if (!response.ok) throw new WpRequestError(response.status);
        return { body, status: response.status, statusText: response.statusText, headers: [...response.headers.entries()] };
      }
      if (attempt === 3) throw new WpRequestError(response.status);
    } catch (error) {
      if (error instanceof WpRequestError) throw error;
      if (attempt === 3) throw new WpRequestError();
      retry = true;
    } finally {
      release();
    }
    if (retry) await new Promise<void>((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
  }
  throw new WpRequestError();
};

/** 応答ごとに独立した本文を渡す。本文が許されない204/205はnullにし、転送時の圧縮ヘッダーを除く。 */
const toResponse = (response: BufferedWpResponse): Response => {
  const headers = new Headers(response.headers);
  headers.delete('content-encoding');
  headers.delete('content-length');
  const body = response.status === 204 || response.status === 205 ? null : response.body;
  return new Response(body, { status: response.status, statusText: response.statusText, headers });
};

/**
 * 実行時（blocking生成・ISR・APIルート）の取得。呼び出し元のsignalでタイムアウトし、
 * 再試行・同時実行制限・バッファリングは行わない。非2xxもそのまま返し、各endpointの従来の再試行に任せる。
 * Cloudflare Workers は redirect: 'error' を受け付けず例外になるため 'manual' を使う。
 * 3xx は非2xx応答として呼び出し元へ返り、秘密ヘッダーはリダイレクト先へ送られない。
 */
const requestWordPressAtRuntime = (request: Request): Promise<Response> =>
  fetch(request.url, {
    method: request.method,
    headers: withBuildToken(request),
    redirect: 'manual',
    signal: request.signal,
  });

/**
 * WP REST のGET専用入口。指定済みWPの同一origin・REST配下だけに秘密ヘッダーを送る。
 * WP_SSG_BUILD はビルド子プロセス限定で設定し、ビルド中だけ長いタイムアウト・再試行・同時4件制限・
 * 同一URLの共有を使う。実行時は利用者のリクエストを長く待たせないよう呼び出し元の設定に従う。
 */
export const wpFetch: typeof fetch = async (input, init) => {
  const request = new Request(input, init);
  const base = process.env.WP_API_URL;
  if (!base) throw new WpRequestError();
  const restBase = new URL(base.replace(/\/wp\/v2\/?$/, '/'));
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== restBase.origin || !url.pathname.startsWith(restBase.pathname)) {
    throw new WpRequestError();
  }
  if (process.env.WP_SSG_BUILD !== '1') return requestWordPressAtRuntime(request);
  return toResponse(await buildResponses.getOrFetch(request.url, () => requestWordPress(request)));
};
