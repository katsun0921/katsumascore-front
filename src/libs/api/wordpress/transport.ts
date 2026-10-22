/** WordPress 専用の通信入口。ビルド中だけ成功レスポンスを共有し、実行時のISRには残さない。 */
let activeRequests = 0;
const waiting: (() => void)[] = [];
const buildResponses = new Map<string, Promise<Response>>();

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

/** 呼び出し元の短いタイムアウトとは独立して、本文読了まで制限・最大3回再試行する。 */
const requestWordPress = async (request: Request): Promise<Response> => {
  for (let attempt = 0; attempt <= 3; attempt += 1) {
    await acquire();
    let retry = false;
    try {
      const headers = new Headers(request.headers);
      const token = process.env.WP_BUILD_TOKEN?.trim();
      if (token) headers.set('x-build-token', token);
      const response = await fetch(request.url, {
        method: request.method,
        headers,
        redirect: 'error',
        signal: AbortSignal.timeout(30_000),
      });
      // 本文を読み終えるまでスロットを保持する。キャッシュ/利用者間でbodyを共有しない。
      const body = await response.arrayBuffer();
      retry = response.status === 429 || response.status >= 500;
      if (!retry) {
        if (!response.ok) throw new WpRequestError(response.status);
        return new Response(body, { status: response.status, headers: response.headers });
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

/**
 * WP REST のGET専用入口。指定済みWPの同一origin・REST配下だけに秘密ヘッダーを送る。
 * WP_SSG_BUILD はビルド子プロセス限定で設定し、同じURLへの同時取得も共有する。
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
  const cacheEnabled = process.env.WP_SSG_BUILD === '1';
  const key = request.url;
  const cached = cacheEnabled ? buildResponses.get(key) : undefined;
  if (cached) return (await cached).clone();
  const pending = requestWordPress(request);
  if (cacheEnabled) buildResponses.set(key, pending);
  try {
    return (await pending).clone();
  } catch (error) {
    buildResponses.delete(key);
    throw error;
  }
};
