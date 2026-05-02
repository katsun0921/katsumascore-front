'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

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
  }
}

export type TabId = 'x' | 'youtube' | 'instagram' | 'tiktok'

export type OfficialSnsProps = {
  /** X（Twitter）公式アカウント URL。例: "https://x.com/MovieOfficial" */
  snsUrl?: string
  /** X が発行する単体ツイート埋め込み（blockquote.twitter-tweet）。プロフィールタイムラインより優先 */
  xEmbedHtml?: string
  /** YouTube 予告編 URL。例: "https://www.youtube.com/watch?v=xxxx" */
  youtubeUrl?: string
  /** Instagram 公式（プロフィール or 投稿 URL）。埋め込み iframe・公式リンク用 */
  instagramUrl?: string
  /** Instagram 埋め込み（blockquote.instagram-media）。指定時は投稿／リールを iframe 化（プロフィール埋め込みより優先） */
  instagramEmbedHtml?: string
  /** TikTok 動画 or 埋め込み用 URL。例: "https://www.tiktok.com/@user/video/123" */
  tiktokUrl?: string
  /** TikTok が発行する blockquote.tiktok-embed スニペット（&lt;script&gt; は除去済み想定でも可） */
  tiktokEmbedHtml?: string
  /** 初期表示タブ（Storybook / テスト用） */
  initialTab?: TabId
  /** IntersectionObserver をスキップして即座に表示（Storybook用） */
  forceVisible?: boolean
  /** Skeleton を強制表示（Storybook用） */
  forceLoading?: boolean
}

// X アカウント URL からスクリーンネームを抽出
const extractXScreenName = (url: string): string | null => {
  try {
    const pathname = new URL(url).pathname;
    const name = pathname.replace(/^\//, '').split('/')[0];
    return name || null;
  } catch {
    return null;
  }
};

// YouTube の動画 URL / チャンネル URL から embed 用 URL を生成（チャンネルはアップロード一覧プレイリスト）
const toYoutubeEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;

    if (parsed.hostname === 'youtu.be') {
      videoId = parsed.pathname.replace(/^\//, '').split('/')[0] ?? null;
    } else if (parsed.hostname.includes('youtube.com')) {
      videoId = parsed.searchParams.get('v');
      if (!videoId) {
        const emb = parsed.pathname.match(/\/embed\/([\w-]{11})/);
        if (emb?.[1]) videoId = emb[1];
      }
      if (!videoId) {
        const sh = parsed.pathname.match(/\/shorts\/([\w-]{11})/);
        if (sh?.[1]) videoId = sh[1];
      }
      if (!videoId) {
        const ch = parsed.pathname.match(/^\/channel\/(UC[\w-]+)/i);
        if (ch?.[1]) {
          const cid = ch[1];
          const uploadsListId = `UU${cid.slice(2)}`;
          return `https://www.youtube.com/embed/videoseries?list=${uploadsListId}`;
        }
      }
    }

    return videoId && /^[\w-]{11}$/.test(videoId)
      ? `https://www.youtube.com/embed/${videoId}?rel=0`
      : null;
  } catch {
    return null;
  }
};

// Instagram アカウント URL からユーザー名を抽出
const extractInstagramUsername = (url: string): string | null => {
  try {
    const pathname = new URL(url).pathname;
    const name = pathname.replace(/^\//, '').split('/')[0];
    return name || null;
  } catch {
    return null;
  }
};

/** 動画ページ・embed URL から TikTok iframe 用 src（/embed/v2/{id}）を生成 */
const toTikTokEmbedIframeSrc = (url: string): string | null => {
  try {
    const u = new URL(url.trim());
    if (!u.hostname.includes('tiktok.com')) return null;
    const v2 = u.pathname.match(/\/embed\/v2\/(\d+)/);
    if (v2?.[1]) return `https://www.tiktok.com/embed/v2/${v2[1]}`;
    const legacy = u.pathname.match(/\/embed\/(\d+)/);
    if (legacy?.[1]) return `https://www.tiktok.com/embed/v2/${legacy[1]}`;
    const vid = u.pathname.match(/\/video\/(\d+)/);
    if (vid?.[1]) return `https://www.tiktok.com/embed/v2/${vid[1]}`;
    return null;
  } catch {
    return null;
  }
};

const extractTikTokVideoIdFromMarkup = (html: string): string | null => {
  const dataId = html.match(/data-video-id="(\d+)"/i);
  if (dataId?.[1]) return dataId[1];
  const cite = html.match(/cite="(https?:\/\/[^"]*tiktok\.com\/@[^"/]+\/video\/(\d+)[^"]*)"/i);
  if (cite?.[2]) return cite[2];
  const emb = html.match(/tiktok\.com\/embed\/v2\/(\d+)/i);
  if (emb?.[1]) return emb[1];
  const embLegacy = html.match(/tiktok\.com\/embed\/(\d+)/i);
  if (embLegacy?.[1]) return embLegacy[1];
  const pathVid = html.match(/tiktok\.com\/@[^/\s"'<>]+\/video\/(\d+)/i);
  if (pathVid?.[1]) return pathVid[1];
  return null;
};

/** CMS 埋め込みスニペットから &lt;script&gt; を除去（各種 widgets / embed.js は自前で読み込む） */
const stripCmsEmbedScripts = (html: string): string =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').trim();

const permalinkToInstagramPostEmbedUrl = (raw: string): string | null => {
  try {
    const u = new URL(raw.trim());
    if (!u.hostname.includes('instagram.com')) return null;
    const path = u.pathname.replace(/\/$/, '');
    const m = path.match(/^\/(p|reel)\/([^/?#]+)/);
    if (m?.[1] && m?.[2]) return `https://www.instagram.com/${m[1]}/${m[2]}/embed/`;
    return null;
  } catch {
    return null;
  }
};

const extractInstagramPermalinkFromMarkup = (html: string): string | null => {
  const m = html.match(/data-instgrm-permalink="([^"]+)"/i);
  if (m?.[1]) return m[1].replace(/&amp;/g, '&').trim();
  const m2 = html.match(
    /href="(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/[^"/]+)/i,
  );
  if (m2?.[1]) return m2[1].replace(/&amp;/g, '&').trim();
  return null;
};

const extractStatusUrlFromTweetEmbedHtml = (html: string): string | undefined => {
  const m = html.match(
    /href="(https?:\/\/(?:twitter\.com|x\.com)\/[^"\\/]+\/status\/\d+[^"]*)"/i,
  );
  if (!m?.[1]) return undefined;
  return m[1].replace(/&amp;/g, '&');
};

/** widgets.js 注入後に API が使えるまで待つ（既に DOM にあるが load が再発火しないケースを含む） */
const callWhenTwitterReady = (fn: () => void) => {
  if (window.twttr?.widgets) {
    fn();
    return;
  }
  const tw = window.twttr;
  if (tw && typeof tw.ready === 'function') {
    tw.ready(fn);
    return;
  }
  if (!document.getElementById('twitter-wjs')) {
    const script = document.createElement('script');
    script.id = 'twitter-wjs';
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    script.onload = () => { callWhenTwitterReady(fn); };
    document.body.appendChild(script);
    return;
  }
  let n = 0;
  const poll = window.setInterval(() => {
    n += 1;
    if (window.twttr?.widgets) {
      window.clearInterval(poll);
      fn();
    } else if (n >= 100) {
      window.clearInterval(poll);
      fn();
    }
  }, 50);
};

export const OfficialSns = ({
  snsUrl,
  xEmbedHtml,
  youtubeUrl,
  instagramUrl,
  instagramEmbedHtml,
  tiktokUrl,
  tiktokEmbedHtml,
  initialTab,
  forceVisible = false,
  forceLoading = false,
}: OfficialSnsProps) => {
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const xWidgetRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(forceVisible);
  const [isLoading, setIsLoading] = useState(true);
  const [xWidgetFailed, setXWidgetFailed] = useState(false);

  const xEmbedMarkup = useMemo(() => {
    if (!xEmbedHtml || !/twitter-tweet/i.test(xEmbedHtml)) return null;
    const cleaned = stripCmsEmbedScripts(xEmbedHtml);
    return cleaned.length > 0 ? cleaned : null;
  }, [xEmbedHtml]);

  const instagramEmbedMarkup = useMemo(() => {
    if (!instagramEmbedHtml || !/instagram-media|data-instgrm-permalink/i.test(instagramEmbedHtml)) {
      return null;
    }
    const cleaned = stripCmsEmbedScripts(instagramEmbedHtml);
    return cleaned.length > 0 ? cleaned : null;
  }, [instagramEmbedHtml]);

  // 利用可能なタブを導出
  const xScreenName = snsUrl ? extractXScreenName(snsUrl) : null;
  const youtubeEmbedUrl = youtubeUrl ? toYoutubeEmbedUrl(youtubeUrl) : null;

  const instagramIframeSrc = useMemo(() => {
    if (instagramEmbedMarkup) {
      const p = extractInstagramPermalinkFromMarkup(instagramEmbedMarkup);
      if (p) {
        const src = permalinkToInstagramPostEmbedUrl(p);
        if (src) return src;
      }
    }
    if (!instagramUrl) return null;
    const postSrc = permalinkToInstagramPostEmbedUrl(instagramUrl);
    if (postSrc) return postSrc;
    const username = extractInstagramUsername(instagramUrl);
    if (!username) return null;
    if (username === 'p' || username === 'reel' || username === 'stories') return null;
    return `https://www.instagram.com/${username}/embed`;
  }, [instagramUrl, instagramEmbedMarkup]);

  const hasInstagramTab = Boolean(instagramIframeSrc);

  const hasXTab = Boolean(xEmbedMarkup || xScreenName);
  const useXProfileTimeline = Boolean(xScreenName && !xEmbedMarkup);
  const xFallbackHref =
    snsUrl ?? (xEmbedMarkup ? extractStatusUrlFromTweetEmbedHtml(xEmbedMarkup) : undefined);

  const tiktokIframeSrc = useMemo(() => {
    if (tiktokUrl) {
      const fromUrl = toTikTokEmbedIframeSrc(tiktokUrl);
      if (fromUrl) return fromUrl;
    }
    if (tiktokEmbedHtml) {
      const id = extractTikTokVideoIdFromMarkup(tiktokEmbedHtml);
      if (id) return `https://www.tiktok.com/embed/v2/${id}`;
    }
    return null;
  }, [tiktokUrl, tiktokEmbedHtml]);

  const hasTikTokTab = Boolean(tiktokIframeSrc);

  const availableTabs: TabId[] = [
    ...(hasXTab ? (['x'] as TabId[]) : []),
    ...(youtubeEmbedUrl ? (['youtube'] as TabId[]) : []),
    ...(hasInstagramTab ? (['instagram'] as TabId[]) : []),
    ...(hasTikTokTab ? (['tiktok'] as TabId[]) : []),
  ];

  const defaultTab: TabId =
    initialTab && availableTabs.includes(initialTab)
      ? initialTab
      : availableTabs[0] ?? 'x';

  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);

  // タブ切替時に Skeleton をリセット
  const handleTabChange = (tab: TabId) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setIsLoading(true);
    setXWidgetFailed(false);
  };

  // IntersectionObserver で遅延読み込み
  useEffect(() => {
    if (forceVisible || availableTabs.length === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // X: 単体ツイート（blockquote）を widgets.load で描画
  useEffect(() => {
    if (!isVisible || activeTab !== 'x' || !xEmbedMarkup || !xWidgetRef.current) return;

    const el = xWidgetRef.current;
    el.innerHTML = xEmbedMarkup;

    const mount = () => {
      if (!window.twttr?.widgets || !xWidgetRef.current) return;
      window.twttr.widgets.load(xWidgetRef.current);
      setIsLoading(false);
      setTimeout(() => {
        if (xWidgetRef.current && xWidgetRef.current.offsetHeight === 0) {
          setXWidgetFailed(true);
        }
      }, 2000);
    };

    callWhenTwitterReady(mount);

    const fallback = setTimeout(() => {
      setIsLoading(false);
      if (xWidgetRef.current && xWidgetRef.current.offsetHeight === 0) {
        setXWidgetFailed(true);
      }
    }, 8000);
    return () => clearTimeout(fallback);
  }, [isVisible, activeTab, xEmbedMarkup]);

  // X: プロフィールタイムライン（embed が無いときのみ）
  useEffect(() => {
    if (!isVisible || activeTab !== 'x' || !useXProfileTimeline || !xScreenName || !xWidgetRef.current) return;

    const target = xWidgetRef.current;
    target.innerHTML = '';

    const mount = () => {
      if (!window.twttr?.widgets || !xWidgetRef.current) return;
      window.twttr.widgets
        .createTimeline(
          { sourceType: 'profile', screenName: xScreenName },
          xWidgetRef.current,
          { lang: locale, tweetLimit: 3, chrome: 'noheader nofooter noborders', dnt: true },
        )
        .then(() => {
          setIsLoading(false);
          setTimeout(() => {
            if (xWidgetRef.current && xWidgetRef.current.offsetHeight === 0) {
              setXWidgetFailed(true);
            }
          }, 2000);
        })
        .catch(() => { setIsLoading(false); setXWidgetFailed(true); });
    };

    callWhenTwitterReady(mount);

    const fallback = setTimeout(() => {
      setIsLoading(false);
      if (xWidgetRef.current && xWidgetRef.current.offsetHeight === 0) {
        setXWidgetFailed(true);
      }
    }, 8000);
    return () => clearTimeout(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, activeTab, useXProfileTimeline, xScreenName]);

  // YouTube / Instagram / TikTok: onLoad が発火しない場合のフォールバック
  useEffect(() => {
    if (!isVisible || activeTab === 'x' || forceLoading) return;
    const timer = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, activeTab]);

  if (availableTabs.length === 0) return null;

  const showSkeleton = forceLoading || isLoading;

  return (
    <div className='official-sns' ref={containerRef}>
      {/* タブリスト */}
      {availableTabs.length > 1 && (
        <div className='official-sns__tablist' role='tablist' aria-label={t(messages, ['tabs', 'label'], locale)}>
          {availableTabs.includes('x') && (
            <button
              role='tab'
              aria-selected={activeTab === 'x'}
              className={`official-sns__tab${activeTab === 'x' ? ' official-sns__tab--active' : ''}`}
              onClick={() => handleTabChange('x')}
            >
              {t(messages, ['tabs', 'x'], locale)}
            </button>
          )}
          {availableTabs.includes('youtube') && (
            <button
              role='tab'
              aria-selected={activeTab === 'youtube'}
              className={`official-sns__tab${activeTab === 'youtube' ? ' official-sns__tab--active' : ''}`}
              onClick={() => handleTabChange('youtube')}
            >
              {t(messages, ['tabs', 'youtube'], locale)}
            </button>
          )}
          {availableTabs.includes('instagram') && (
            <button
              role='tab'
              aria-selected={activeTab === 'instagram'}
              className={`official-sns__tab${activeTab === 'instagram' ? ' official-sns__tab--active' : ''}`}
              onClick={() => handleTabChange('instagram')}
            >
              {t(messages, ['tabs', 'instagram'], locale)}
            </button>
          )}
          {availableTabs.includes('tiktok') && (
            <button
              role='tab'
              aria-selected={activeTab === 'tiktok'}
              className={`official-sns__tab${activeTab === 'tiktok' ? ' official-sns__tab--active' : ''}`}
              onClick={() => handleTabChange('tiktok')}
            >
              {t(messages, ['tabs', 'tiktok'], locale)}
            </button>
          )}
        </div>
      )}

      {/* コンテンツエリア */}
      <div
        role='tabpanel'
        aria-label={t(messages, ['tabs', activeTab], locale)}
        className='official-sns__panel'
      >
        {!isVisible ? (
          // ビューポートに入るまでプレースホルダー表示
          <div className='official-sns__placeholder' aria-hidden='true'>
            <span className='official-sns__placeholder-text'>
              {t(messages, ['placeholder', 'loading'], locale)}
            </span>
          </div>
        ) : (
          <>
            {/* Skeleton */}
            {showSkeleton && (
              <div className='official-sns__skeleton' aria-hidden='true' />
            )}

            {/* X（単体 embed or プロフィールタイムライン） */}
            {activeTab === 'x' && hasXTab && !xWidgetFailed && (
              <div
                ref={xWidgetRef}
                className='official-sns__x-widget'
                style={showSkeleton ? { visibility: 'hidden', position: 'absolute' } : undefined}
              />
            )}
            {/* X ウィジェット失敗時のフォールバックリンク */}
            {activeTab === 'x' && hasXTab && xWidgetFailed && xFallbackHref && (
              <a
                href={xFallbackHref}
                target='_blank'
                rel='noopener noreferrer'
                className='official-sns__fallback-link'
              >
                {t(messages, ['fallback', 'xLink'], locale)}
              </a>
            )}

            {/* YouTube */}
            {activeTab === 'youtube' && youtubeEmbedUrl && (
              <iframe
                src={youtubeEmbedUrl}
                className='official-sns__iframe official-sns__iframe--youtube'
                style={showSkeleton ? { visibility: 'hidden', position: 'absolute' } : undefined}
                title={t(messages, ['iframe', 'youtubeTitle'], locale)}
                loading='lazy'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
                onLoad={() => setIsLoading(false)}
              />
            )}

            {/* Instagram（投稿・リール embed またはプロフィール embed） */}
            {activeTab === 'instagram' && instagramIframeSrc && (
              <iframe
                src={instagramIframeSrc}
                className='official-sns__iframe official-sns__iframe--instagram'
                style={showSkeleton ? { visibility: 'hidden', position: 'absolute' } : undefined}
                title={t(messages, ['iframe', 'instagramTitle'], locale)}
                loading='lazy'
                allow='encrypted-media; fullscreen'
                onLoad={() => setIsLoading(false)}
              />
            )}

            {activeTab === 'tiktok' && tiktokIframeSrc && (
              <iframe
                src={tiktokIframeSrc}
                className='official-sns__iframe official-sns__iframe--tiktok'
                style={showSkeleton ? { visibility: 'hidden', position: 'absolute' } : undefined}
                title={t(messages, ['iframe', 'tiktokTitle'], locale)}
                loading='lazy'
                allow='encrypted-media; fullscreen; picture-in-picture'
                allowFullScreen
                onLoad={() => setIsLoading(false)}
              />
            )}

            {/* ACF link: 埋め込み直下（X / Instagram / TikTok。YouTube は対象外） */}
            {!showSkeleton && activeTab === 'x' && hasXTab && !xWidgetFailed && snsUrl && (
              <a
                href={snsUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='official-sns__official-link'
              >
                {t(messages, ['officialLink', 'x'], locale)}
              </a>
            )}
            {!showSkeleton && activeTab === 'instagram' && instagramUrl && (
              <a
                href={instagramUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='official-sns__official-link'
              >
                {t(messages, ['officialLink', 'instagram'], locale)}
              </a>
            )}
            {!showSkeleton && activeTab === 'tiktok' && tiktokUrl && (
              <a
                href={tiktokUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='official-sns__official-link'
              >
                {t(messages, ['officialLink', 'tiktok'], locale)}
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
};
