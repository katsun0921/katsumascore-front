import React from 'react'
import './VodItem.scss'

export type TVodService =
  | 'netflix'
  | 'amazon'
  | 'unext'
  | 'disney'
  | 'dmmtv'
  | 'youtube'
  | 'appletv'
  | 'abema'

export type TVodItemProps = {
  service: TVodService
  streamingUrl: string
  signupUrl?: string
  streamingText?: string
  unregisteredText?: string
  isPaid?: boolean
  locale?: 'ja' | 'en'
}

const SERVICE_LABELS: Record<TVodService, string> = {
  netflix: 'Netflix',
  amazon: 'Amazon Prime Video',
  unext: 'U-NEXT',
  disney: 'Disney+',
  dmmtv: 'DMM TV',
  youtube: 'YouTube',
  appletv: 'Apple TV+',
  abema: 'ABEMA',
}

export const VodItem = ({
  service,
  streamingUrl,
  signupUrl,
  streamingText,
  unregisteredText,
  isPaid = false,
  locale = 'ja',
}: TVodItemProps) => {
  const label = SERVICE_LABELS[service]
  const defaultStreamingText =
    streamingText ||
    (locale === 'en'
      ? 'You can access the distribution by following this link.'
      : '配信はこちらのリンクから移動できます。')
  const defaultUnregisteredText =
    unregisteredText ||
    (locale === 'en'
      ? 'If you have not yet registered, you can do so here.'
      : '未登録の方はこちらから登録できます。')

  return (
    <div className={['vod-item', `vod-item--${service}`].join(' ')}>
      {isPaid && (
        <em className='vod-item__paid'>
          {locale === 'en' ? 'This distribution is paid.' : 'この配信は有料になります。'}
        </em>
      )}
      <div className='vod-item__logo-wrap'>
        <span className='vod-item__service-name'>{label}</span>
      </div>
      {signupUrl && (
        <a
          className='vod-item__signup'
          href={signupUrl}
          target='_blank'
          rel='noopener noreferrer'
        >
          {defaultUnregisteredText}
        </a>
      )}
      <a
        className='vod-item__watch'
        href={streamingUrl}
        target='_blank'
        rel='noopener noreferrer'
      >
        {defaultStreamingText}
      </a>
    </div>
  )
}
