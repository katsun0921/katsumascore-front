'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'
export type TabId = 'x' | 'youtube' | 'instagram'

export type OfficialSnsProps = {
  /** X（Twitter）公式アカウント URL。例: "https://x.com/MovieOfficial" */
  snsUrl?: string
  /** YouTube 予告編 URL。例: "https://www.youtube.com/watch?v=xxxx" */
  youtubeUrl?: string
  /** Instagram 公式アカウント URL。例: "https://www.instagram.com/MovieOfficial" */
  instagramUrl?: string
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
    const pathname = new URL(url).pathname
    const name = pathname.replace(/^\//, '').split('/')[0]
    return name || null
  } catch {
    return null
  }
}

// YouTube の通常 URL / 短縮 URL から embed URL を生成
const toYoutubeEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url)
    let videoId: string | null = null

    if (parsed.hostname === 'youtu.be') {
      videoId = parsed.pathname.replace(/^\//, '')
    } else if (parsed.hostname.includes('youtube.com')) {
      videoId = parsed.searchParams.get('v')
    }

    return videoId
      ? `https://www.youtube.com/embed/${videoId}?rel=0`
      : null
  } catch {
    return null
  }
}

// Instagram アカウント URL からユーザー名を抽出
const extractInstagramUsername = (url: string): string | null => {
  try {
    const pathname = new URL(url).pathname
    const name = pathname.replace(/^\//, '').split('/')[0]
    return name || null
  } catch {
    return null
  }
}

export const OfficialSns = ({
  snsUrl,
  youtubeUrl,
  instagramUrl,
  initialTab,
  forceVisible = false,
  forceLoading = false,
}: OfficialSnsProps) => {
  const locale = useLocale()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(forceVisible)
  const [isLoading, setIsLoading] = useState(true)

  // 利用可能なタブを導出
  const xScreenName = snsUrl ? extractXScreenName(snsUrl) : null
  const youtubeEmbedUrl = youtubeUrl ? toYoutubeEmbedUrl(youtubeUrl) : null
  const instagramUsername = instagramUrl ? extractInstagramUsername(instagramUrl) : null

  const availableTabs: TabId[] = [
    ...(xScreenName ? (['x'] as TabId[]) : []),
    ...(youtubeEmbedUrl ? (['youtube'] as TabId[]) : []),
    ...(instagramUsername ? (['instagram'] as TabId[]) : []),
  ]

  const defaultTab: TabId =
    initialTab && availableTabs.includes(initialTab)
      ? initialTab
      : availableTabs[0] ?? 'x'

  const [activeTab, setActiveTab] = useState<TabId>(defaultTab)

  // タブ切替時に Skeleton をリセット
  const handleTabChange = (tab: TabId) => {
    if (tab === activeTab) return
    setActiveTab(tab)
    setIsLoading(true)
  }

  // IntersectionObserver で遅延読み込み
  useEffect(() => {
    if (forceVisible || availableTabs.length === 0) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )

    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (availableTabs.length === 0) return null

  const showSkeleton = forceLoading || isLoading

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

            {/* X タイムライン */}
            {activeTab === 'x' && xScreenName && (
              <iframe
                src={`https://syndication.twitter.com/srv/timeline-profile/screen-name/${xScreenName}?dnt=true&limit=3&chrome=noheader%20nofooter`}
                className='official-sns__iframe official-sns__iframe--x'
                style={showSkeleton ? { visibility: 'hidden', position: 'absolute' } : undefined}
                title={`${xScreenName} on X`}
                loading='lazy'
                scrolling='no'
                onLoad={() => setIsLoading(false)}
              />
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

            {/* Instagram */}
            {activeTab === 'instagram' && instagramUsername && (
              <iframe
                src={`https://www.instagram.com/${instagramUsername}/embed`}
                className='official-sns__iframe official-sns__iframe--instagram'
                style={showSkeleton ? { visibility: 'hidden', position: 'absolute' } : undefined}
                title={`${instagramUsername} on Instagram`}
                loading='lazy'
                onLoad={() => setIsLoading(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
