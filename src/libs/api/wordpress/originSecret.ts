/** Cloudflare 経由でも Worker からの取得には Transform Rule が効かないため、アプリ側から送る秘密ヘッダー。 */
export const ORIGIN_SECRET_HEADER = 'x-origin-secret';

/** `WP_ORIGIN_SECRET`（Workers の secret）がある環境だけ、オリジン確認用ヘッダーを付ける。値はログや応答へ出さない。 */
export const withOriginSecret = (headers: Headers): Headers => {
  const secret = process.env.WP_ORIGIN_SECRET?.trim();
  if (secret) headers.set(ORIGIN_SECRET_HEADER, secret);
  return headers;
};
