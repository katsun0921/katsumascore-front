/** WP の画像URL（`/wp-content/uploads/`）を自サイトの `/media/` へ書き換える。cms のホスト名を公開側へ出さないため。 */
const UPLOADS_PATH = '/wp-content/uploads/';
const DEFAULT_SITE_URL = 'https://katsumascore.blog';

/** 書き換え後の接頭辞（例: `https://katsumascore.blog/media/`）。OG画像・JSON-LD でも使えるよう絶対URLにする。 */
export const getMediaBaseUrl = (): string => {
  const site = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, '');
  return `${site}/media/`;
};

/** JSON文字列中の画像URLを書き換える。PHPが `\/` にエスケープした形も、通常の形も扱う。 */
export const rewriteMediaUrls = (text: string, wpOrigin: string, mediaBase = getMediaBaseUrl()): string => {
  const plain = `${wpOrigin}${UPLOADS_PATH}`;
  const escape = (value: string) => value.replaceAll('/', '\\/');
  return text.split(escape(plain)).join(escape(mediaBase)).split(plain).join(mediaBase);
};

/** `/media/<path>` から WP 側のパスを組み立てる。安全でない区切り・拡張子は `null`。 */
const ALLOWED_EXTENSIONS = new Set(['webp', 'jpg', 'jpeg', 'png', 'gif', 'avif']);
const SEGMENT = /^[A-Za-z0-9._-]+$/;

export const toUploadsPath = (segments: readonly string[]): string | null => {
  if (segments.length === 0) return null;
  if (!segments.every((segment) => SEGMENT.test(segment) && segment !== '.' && segment !== '..')) return null;
  const extension = segments[segments.length - 1].split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.has(extension)) return null;
  return segments.join('/');
};
