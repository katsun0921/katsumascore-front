import React from 'react'
import './VodPanel.scss'
import { VodItem, TVodService } from '@/components/ui/VodItem/VodItem'

export type TVodPanelEntry = {
  service: TVodService
  url: string
  signupUrl?: string
  isPaid?: boolean
}

export type TVodPanelProps = {
  services: TVodPanelEntry[]
  isCinema?: boolean
  titleJp?: string
  locale?: 'ja' | 'en'
}

export const VodPanel = ({ services, isCinema = false, titleJp, locale = 'ja' }: TVodPanelProps) => {
  if (isCinema) {
    return (
      <div className='p-vod-panel p-vod-panel--cinema'>
        <span className='p-vod-panel__cinema-badge'>
          {locale === 'en' ? 'Now in Theaters' : '劇場公開中'}
        </span>
        <p className='p-vod-panel__cinema-note'>
          {locale === 'en'
            ? 'VOD streaming is not available during theatrical release.'
            : '劇場公開中のためVOD配信は表示していません。'}
        </p>
      </div>
    )
  }

  const active = services.filter((s) => s.url)
  if (!active.length) return null

  return (
    <div className='p-vod-panel'>
      {titleJp && (
        <h2 className='p-vod-panel__heading'>
          {locale === 'en'
            ? 'Streaming Services'
            : `${titleJp}の動画配信サービス`}
        </h2>
      )}
      <ul className='p-vod-panel__list'>
        {active.map((entry, i) => (
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
    </div>
  )
}
