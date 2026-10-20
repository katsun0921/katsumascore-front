'use client';

import { useEffect } from 'react';

/** 別窓アイコン（CSS の ::after で描画）を有効にする目印属性 */
const ICON_ATTR = 'data-external-icon';

/** アイコンを付けない（ボタン・カード型リンク）アンカーの祖先セレクタ */
const ICON_EXCLUDE_SELECTOR =
  '.product-block, .wp-block-button, .vlp-link-container, .twitter-tweet, .instagram-media, .tiktok-embed';

/** www. の有無を無視してホスト名を比較できるよう正規化する */
const normalizeHost = (hostname: string): string => {
  return hostname.replace(/^www\./, '').toLowerCase();
};

/** 自ドメイン以外の http(s) リンクかを判定する */
const isExternalLink = (anchor: HTMLAnchorElement): boolean => {
  const href = anchor.getAttribute('href');
  if (!href) return false;
  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return false;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  return normalizeHost(url.hostname) !== normalizeHost(window.location.hostname);
};

/** rel 属性に noopener が無ければ既存値を保ったまま追加する */
const addNoopener = (anchor: HTMLAnchorElement) => {
  const tokens = (anchor.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean);
  if (tokens.includes('noopener')) return;
  anchor.setAttribute('rel', [...tokens, 'noopener'].join(' '));
};

/** アイコンを付けてよいアンカーか（テキストを持ち、画像のみ・ボタン・カード型ではない） */
const shouldAppendIcon = (anchor: HTMLAnchorElement): boolean => {
  if (anchor.hasAttribute(ICON_ATTR)) return false;
  if (anchor.closest(ICON_EXCLUDE_SELECTOR)) return false;
  if (anchor.querySelector('img')) return false;
  return (anchor.textContent ?? '').trim().length > 0;
};

/**
 * 記事本文（WordPress content.rendered）内の外部ドメインリンクを検出し、
 * target="_blank" と rel="noopener" を付与したうえで別窓アイコン用の data-external-icon 属性を付与する（アイコン自体は PostContent.scss の CSS で描画）。
 * 自ドメイン・相対パス・mailto / tel / ページ内アンカーは対象外。
 * 既存の target / rel は上書きせず、rel は noopener を追記するだけにする。
 * 何度実行しても結果が変わらない（冪等）。
 */
export const useExternalLinks = (containerId: string, content: string) => {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((anchor) => {
      if (!isExternalLink(anchor)) return;
      if (anchor.getAttribute('target') !== '_blank') {
        anchor.setAttribute('target', '_blank');
      }
      addNoopener(anchor);
      if (shouldAppendIcon(anchor)) {
        anchor.setAttribute(ICON_ATTR, '');
      }
    });
    // content が変わるたび（記事切替・ページ遷移）に再走査する
  }, [containerId, content]);
};
