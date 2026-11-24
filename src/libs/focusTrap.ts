/**
 * モーダルの中にキーボードのフォーカスを閉じ込める処理（サヨの要約モーダル・同意画面で共用）。
 */

/** フォーカスを受け取れる要素 */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/**
 * Tab・Shift+Tab でフォーカスがモーダルの外へ出ないようにする（先頭と末尾で折り返す）
 * @param e キーイベント（Tab のときに呼ぶ）
 * @param sheet モーダル本体。null なら何もしない
 */
export const trapFocus = (e: KeyboardEvent, sheet: HTMLElement | null) => {
  if (!sheet) return;
  const nodes = sheet.querySelectorAll<HTMLElement>(FOCUSABLE);
  if (nodes.length === 0) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const active = document.activeElement;
  if (!sheet.contains(active)) {
    // すでに外にある（背景をクリックした直後など）ときは、先頭へ戻す
    e.preventDefault();
    first.focus();
  } else if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
};
