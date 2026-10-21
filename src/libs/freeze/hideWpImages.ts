/**
 * SSG 凍結モードで、WordPress 上の画像を一切参照しないようにするためのヘルパー。
 *
 * WP 停止中は画像も配信できず、ページ表示のたびに WP へリクエストが飛ぶことを避けるため、
 * `/wp-content/` を含む画像はダミー画像（`public/images/freeze-dummy.svg`）に差し替える。
 * 非表示にするとレイアウトが崩れるため、寸法・クラスはそのままにして中身だけ置き換える。
 * 凍結モード以外では何もしない。
 */
import { isSsgFreeze } from './ssgFreeze';

const WP_CONTENT_PATH = '/wp-content/';

/** WP 画像の代わりに表示するダミー画像（`public/` 配下）。 */
export const FREEZE_DUMMY_IMAGE = '/images/freeze-dummy.svg';

/** 凍結モードでダミー画像に差し替えるべき WP 画像の URL か。 */
export const isWpImageUrl = (src: unknown): boolean =>
  isSsgFreeze() && typeof src === 'string' && src.includes(WP_CONTENT_PATH);

/** `<img>` タグ 1 つの WP 画像参照を外し、src をダミー画像にする（寸法・class・alt は維持）。 */
const replaceImgTag = (tag: string): string => {
  const cleaned = tag.replace(/\s(?:src|srcset|data-src|data-srcset|data-lazy-src|sizes)=("[^"]*"|'[^']*')/gi, '');
  return cleaned.replace(/<img\b/i, `<img src="${FREEZE_DUMMY_IMAGE}"`);
};

/**
 * 本文 HTML 内の WP 画像をダミー画像に差し替える。凍結モード以外では入力をそのまま返す。
 * - `/wp-content/` を含む `<img>` は src をダミーにし、srcset 等を除去する
 * - `/wp-content/` を含む `<source>` は削除する（`<picture>` は `<img>` にフォールバックする）
 * - インライン style の `url(.../wp-content/...)` はダミー画像にする
 */
export const replaceWpImagesInHtml = (html: string): string => {
  if (!isSsgFreeze() || !html.includes(WP_CONTENT_PATH)) return html;
  return html
    .replace(/<img\b[^>]*>/gi, (tag) => (tag.includes(WP_CONTENT_PATH) ? replaceImgTag(tag) : tag))
    .replace(/<source\b[^>]*>/gi, (tag) => (tag.includes(WP_CONTENT_PATH) ? '' : tag))
    .replace(/url\(\s*['"]?[^)'"]*\/wp-content\/[^)]*\)/gi, `url(${FREEZE_DUMMY_IMAGE})`);
};
