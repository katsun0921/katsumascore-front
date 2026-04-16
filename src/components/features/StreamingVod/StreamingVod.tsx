import React from 'react'
import './StreamingVod.scss'
import { VodItem } from '@/components/features/vod/VodItem/VodItem'
import type { VodService as TVodService } from '@/lib/vod'

export type TStreamingVodEntry = {
  service: TVodService
  url: string
  signupUrl?: string
  isPaid?: boolean
}

export type TStreamingVodProps = {
  titleJp?: string
  titleEn?: string
  services: TStreamingVodEntry[]
  locale?: 'ja' | 'en'
}

export const StreamingVod = ({ titleJp, titleEn, services, locale = 'ja' }: TStreamingVodProps) => {
  if (!services.length) return null

  const title = locale === 'en' ? titleEn : titleJp
  const headingText =
    locale === 'en'
      ? `You can access ${titleEn || 'this title'} through various video distribution services.`
      : `${titleJp || 'この作品'}は、様々な動画配信サービスで配信中です。`

  return (
    <section className='p-streaming-vod'>
      <h2 className='p-streaming-vod__heading'>{title ? headingText : (locale === 'en' ? 'Streaming Services' : '動画配信サービス')}</h2>
      <ul className='p-streaming-vod__list'>
        {services.map((entry, i) => (
          <li key={i}>
            <VodItem
              service={entry.service}
              streamingUrl={entry.url}
              signupUrl={entry.signupUrl}
              isPaid={entry.isPaid}
              locale={locale}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
