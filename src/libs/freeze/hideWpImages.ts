/**
 * SSG 凍結モードで、WordPress 上の画像を一切参照しないようにするためのヘルパー。
 *
 * WP 停止中は画像も配信できず、ページ表示のたびに WP へリクエストが飛ぶことを避けるため、
 * `/wp-content/` を含む画像は一時的に非表示にする（凍結モード以外では何もしない）。
 */
import { isSsgFreeze } from './ssgFreeze';

const WP_CONTENT_PATH = '/wp-content/';

/** 凍結モードで非表示にすべき WP 画像の URL か。 */
export const isWpImageUrl = (src: unknown): boolean =>
  isSsgFreeze() && typeof src === 'string' && src.includes(WP_CONTENT_PATH);

/**
 * 本文 HTML から WP 画像を取り除く。凍結モード以外では入力をそのまま返す。
 * - `/wp-content/` を含む `<img>` / `<source>` を削除する
 * - インライン style の `url(.../wp-content/...)` を `none` にする
 */
export const stripWpImagesFromHtml = (html: string): string => {
  if (!isSsgFreeze() || !html.includes(WP_CONTENT_PATH)) return html;
  return html
    .replace(/<(img|source)\b[^>]*>/gi, (tag) => (tag.includes(WP_CONTENT_PATH) ? '' : tag))
    .replace(/url\(\s*['"]?[^)'"]*\/wp-content\/[^)]*\)/gi, 'none');
};
