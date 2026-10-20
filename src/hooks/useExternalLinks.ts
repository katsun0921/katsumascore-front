'use client';

import { useEffect } from 'react';

const SVG_NS = 'http://www.w3.org/2000/svg';
const ICON_CLASS = 'p-content__externalIcon';

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

/** 「別窓で開く」アイコン（currentColor の inline SVG）を生成する */
const createExternalIcon = (): SVGSVGElement => {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', ICON_CLASS);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '1em');
  svg.setAttribute('height', '1em');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5');
  svg.appendChild(path);
  return svg;
};

/** アイコンを付けてよいアンカーか（テキストを持ち、画像のみ・ボタン・カード型ではない） */
const shouldAppendIcon = (anchor: HTMLAnchorElement): boolean => {
  if (anchor.querySelector(`.${ICON_CLASS}`)) return false;
  if (anchor.closest(ICON_EXCLUDE_SELECTOR)) return false;
  if (anchor.querySelector('img')) return false;
  return (anchor.textContent ?? '').trim().length > 0;
};

/**
 * 記事本文（WordPress content.rendered）内の外部ドメインリンクを検出し、
 * target="_blank" と rel="noopener" を付与したうえで別窓アイコンを末尾に追加する。
 * 自ドメイン・相対パス・mailto / tel / ページ内アンカーは対象外。
 * 既存の target / rel は上書きせず、rel は noopener を追記するだけにする。
 * 何度実行してもアイコンが重複しない（冪等）。
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
        anchor.appendChild(createExternalIcon());
      }
    });
    // content が変わるたび（記事切替・ページ遷移）に再走査する
  }, [containerId, content]);
};
