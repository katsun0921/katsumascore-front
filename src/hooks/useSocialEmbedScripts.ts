'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    twttr?: {
      ready?: (cb: () => void) => void
      widgets?: {
        createTimeline: (
          dataSource: { sourceType: string; screenName: string },
          target: HTMLElement,
          options?: Record<string, unknown>,
        ) => Promise<HTMLElement | undefined>
        load: (el?: HTMLElement) => void
      }
    }
    instgrm?: {
      Embeds?: {
        process: () => void
      }
    }
  }
}

const SCRIPT_SOURCES = {
  twitter: 'https://platform.twitter.com/widgets.js',
  instagram: 'https://www.instagram.com/embed.js',
  tiktok: 'https://www.tiktok.com/embed.js',
} as const;

const loadScriptOnce = (id: string, src: string, onload?: () => void) => {
  const existing = document.getElementById(id);
  if (existing) {
    onload?.();
    return;
  }
  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;
  if (onload) script.onload = onload;
  document.body.appendChild(script);
};

/**
 * 記事本文（WordPress content.rendered）内の X / Instagram / TikTok 埋め込み blockquote を
 * 各プラットフォームの widgets/embed スクリプトで実際の埋め込み（iframe・画像付きカード）に変換する。
 * dangerouslySetInnerHTML 経由で挿入された <script> タグはブラウザ仕様で実行されないため、
 * ここで明示的にスクリプトのロードと再実行をトリガーする。
 */
export const useSocialEmbedScripts = (containerId: string, content: string) => {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (container.querySelector('.twitter-tweet')) {
      loadScriptOnce('twitter-wjs', SCRIPT_SOURCES.twitter, () => {
        window.twttr?.widgets?.load(container);
      });
      window.twttr?.widgets?.load(container);
    }

    if (container.querySelector('.instagram-media')) {
      loadScriptOnce('instagram-embed-js', SCRIPT_SOURCES.instagram, () => {
        window.instgrm?.Embeds?.process();
      });
      window.instgrm?.Embeds?.process();
    }

    if (container.querySelector('.tiktok-embed')) {
      // TikTok の embed.js は読み込み時に自動で DOM 内の blockquote.tiktok-embed を走査するため、
      // 未ロード時のみスクリプトを注入する（明示的な再実行 API はない）
      loadScriptOnce('tiktok-embed-js', SCRIPT_SOURCES.tiktok);
    }
    // content が変わるたび（記事切替・ページ遷移）に再走査する
  }, [containerId, content]);
};
