/**
 * URL正規化ロジックのバージョン。
 * このバージョンを Cloudflare Edge の Cache Key に含めることで、
 * normalize ロジック改修時に旧キャッシュを自動的に無効化する。
 * 改修時はこの値を上げ、Cloudflare Cache を全パージする。
 */
export const NORMALIZE_VERSION = 'v1';
