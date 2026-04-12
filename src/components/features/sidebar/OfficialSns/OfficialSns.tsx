'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'
import './OfficialSns.scss'

export type OfficialSnsProps = {
  /** X（Twitter）公式アカウント URL。例: "https://x.com/MovieOfficial" */
  snsUrl?: string
  /** YouTube 予告編 URL（snsUrl がない場合のフォールバック）。例: "https://www.youtube.com/watch?v=xxxx" */
  youtubeUrl?: string
}

// X アカウント URL からスクリーンネームを抽出
function extractXScreenName(url: string): string | null {
  try {
    const pathname = new URL(url).pathname
    // "/MovieOfficial" → "MovieOfficial"
    const name = pathname.replace(/^\//, '').split('/')[0]
    return name || null
  } catch {
    return null
  }
}

// YouTube の通常 URL / 短縮 URL から embed URL を生成
function toYoutubeEmbedUrl(url: string): string | null {
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

type EmbedMode = 'x' | 'youtube' | 'none'

export const OfficialSns = ({ snsUrl, youtubeUrl }: OfficialSnsProps) => {
  const locale = useLocale()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // どのモードで表示するか決定
  const xScreenName = snsUrl ? extractXScreenName(snsUrl) : null
  const youtubeEmbedUrl = youtubeUrl ? toYoutubeEmbedUrl(youtubeUrl) : null

  const mode: EmbedMode = xScreenName
    ? 'x'
    : youtubeEmbedUrl
      ? 'youtube'
      : 'none'

  // IntersectionObserver で遅延読み込み
  useEffect(() => {
    if (mode === 'none') return

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
  }, [mode])

  if (mode === 'none') return null

  return (
    <div className='sidebar-official-sns'>
      <div className='sidebar-official-sns__embed' ref={containerRef}>
        {!isVisible ? (
          // プレースホルダー（ビューポートに入るまで表示）
          <div className='sidebar-official-sns__placeholder' aria-hidden='true'>
            <span className='sidebar-official-sns__placeholder-text'>
              {t(messages, ['placeholder', 'loading'], locale)}
            </span>
          </div>
        ) : mode === 'x' ? (
          // X タイムライン embed
          <iframe
            src={`https://syndication.twitter.com/srv/timeline-profile/screen-name/${xScreenName}?dnt=true&limit=3&chrome=noheader%20nofooter`}
            className='sidebar-official-sns__iframe sidebar-official-sns__iframe--x'
            title={`${xScreenName} on X`}
            loading='lazy'
            scrolling='no'
          />
        ) : (
          // YouTube embed
          <iframe
            src={youtubeEmbedUrl!}
            className='sidebar-official-sns__iframe sidebar-official-sns__iframe--youtube'
            title='Official YouTube'
            loading='lazy'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          />
        )}
      </div>
    </div>
  )
}
