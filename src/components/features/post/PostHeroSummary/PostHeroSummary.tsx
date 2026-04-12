import Image from 'next/image'
import { t } from '@/i18n/t'
import type { Locale } from '@/i18n/t'
import { messages } from './i18n'
import './PostHeroSummary.scss'

export type PostHeroSummaryProps = {
  posterUrl: string
  text: string
  refUrl?: string
  refLabel?: string
  locale?: Locale
}

export function PostHeroSummary(props: PostHeroSummaryProps) {
  const { posterUrl, text, refUrl, refLabel, locale = 'ja' } = props
  return (
    <section className='post-hero-summary'>
      <div className='post-hero-summary__poster'>
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt=''
            fill
            sizes='(min-width: 768px) 140px, 100px'
            className='post-hero-summary__poster-img'
          />
        ) : (
          <div className='post-hero-summary__poster-placeholder' aria-hidden />
        )}
      </div>
      <div>
        <h2 className='post-hero-summary__heading'>{t(messages, ['heading'], locale)}</h2>
          <blockquote className='post-hero-summary__quote'>
            <p className='post-hero-summary__quote-text'>{text}</p>
            {(refUrl || refLabel) && (
              <cite className='post-hero-summary__cite'>
                {refUrl ? (
                  <a href={refUrl} target='_blank' rel='noopener noreferrer'>
                    {refLabel || refUrl}
                  </a>
                ) : (
                  refLabel
                )}
              </cite>
            )}
          </blockquote>
      </div>
    </section>
  )
}
