import Image from 'next/image'
import { t } from '@/i18n/t'
import type { Locale } from '@/i18n/t'
import { messages } from './i18n'
import './PostHeroSummary.scss'

export type PostHeroSummaryProps =
  | {
      posterUrl: string
      description: string
    }
  | {
      text: string
      refUrl?: string
      refLabel?: string
      locale?: Locale
    }

function isArticleSummary(
  props: PostHeroSummaryProps,
): props is Extract<PostHeroSummaryProps, { text: string }> {
  return 'text' in props
}

export function PostHeroSummary(props: PostHeroSummaryProps) {
  if (isArticleSummary(props)) {
    const { text, refUrl, refLabel, locale = 'ja' } = props
    return (
      <section className='p-summary'>
        <h2 className='p-summary__heading'>{t(messages, ['heading'], locale)}</h2>
        <blockquote className='p-summary__quote'>
          <p>{text}</p>
          {(refUrl || refLabel) && (
            <cite>
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
      </section>
    )
  }

  const { posterUrl, description } = props
  return (
    <div className='post-hero-summary'>
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
      <p className='post-hero-summary__description'>{description}</p>
    </div>
  )
}
