import React from 'react'
import { useLocale } from '@/i18n/provider'
export type ReviewSiteId = 'imdb' | 'rt-critics' | 'rt-audience' | 'filmarks' | 'eiga-com'

export type TReviewSite = {
  siteId: ReviewSiteId
  label?: string
  score: number
  maxScore?: number
  unit?: string
  summary: string
  url?: string
}

export type TReviewSiteScoresProps = {
  sites: TReviewSite[]
  updatedAt?: string
  publishedDate?: string
}

const SITE_ORDER: ReviewSiteId[] = ['imdb', 'rt-critics', 'rt-audience', 'filmarks', 'eiga-com']

const SITE_CONFIG: Record<
  ReviewSiteId,
  { labelJa: string; labelEn: string; maxScore: number; unit: string; modifier: string }
> = {
  imdb: {
    labelJa: 'IMDb',
    labelEn: 'IMDb',
    maxScore: 10,
    unit: ' /10',
    modifier: 'p-review-scores__fill--imdb',
  },
  'rt-critics': {
    labelJa: 'RT 批評家',
    labelEn: 'RT Critics',
    maxScore: 100,
    unit: '%',
    modifier: 'p-review-scores__fill--rt',
  },
  'rt-audience': {
    labelJa: 'RT 観客',
    labelEn: 'RT Audience',
    maxScore: 100,
    unit: '%',
    modifier: 'p-review-scores__fill--rt-audience',
  },
  filmarks: {
    labelJa: 'Filmarks',
    labelEn: 'Filmarks',
    maxScore: 5,
    unit: ' /5',
    modifier: 'p-review-scores__fill--filmarks',
  },
  'eiga-com': {
    labelJa: '映画.com',
    labelEn: 'Eiga.com',
    maxScore: 5,
    unit: ' /5',
    modifier: 'p-review-scores__fill--eiga-com',
  },
}

const formatDate = (value: string, locale: 'ja' | 'en') => {
  let date: Date

  if (/^\d{8}$/.test(value)) {
    date = new Date(Number(value.slice(0, 4)), Number(value.slice(4, 6)) - 1, Number(value.slice(6, 8)))
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    date = new Date(year, month - 1, day)
  } else {
    date = new Date(value)
  }

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

const formatScore = (score: number, maxScore: number) => {
  if (maxScore === 100) return String(Math.round(score))
  return Number.isInteger(score) ? String(score) : score.toFixed(1)
}

export const ReviewSiteScores = ({
  sites,
  updatedAt,
  publishedDate,
}: TReviewSiteScoresProps) => {
  const locale = useLocale()
  const validSites = sites
    .filter((site) => site.score > 0)
    .sort((a, b) => SITE_ORDER.indexOf(a.siteId) - SITE_ORDER.indexOf(b.siteId))

  if (!validSites.length) return null

  const datedAt = updatedAt ?? publishedDate
  const formattedDate = datedAt ? formatDate(datedAt, locale) : null

  return (
    <section className='p-review-scores'>
      <h2 className='p-review-scores__heading'>
        {locale === 'en' ? 'Review Site Scores' : '各サイトのレビュースコア'}
      </h2>
      <ul className='p-review-scores__list'>
        {validSites.map((site) => {
          const config = SITE_CONFIG[site.siteId]
          const maxScore = site.maxScore ?? config.maxScore
          const unit = site.unit ?? config.unit
          const label = site.label ?? (locale === 'en' ? config.labelEn : config.labelJa)
          const fillPercent = Math.max(0, Math.min((site.score / maxScore) * 100, 100))
          const scoreText = `${formatScore(site.score, maxScore)}${unit}`

          return (
            <li key={site.siteId} className='p-review-scores__item'>
              <div className='p-review-scores__row'>
                <span className='p-review-scores__label'>{label}</span>
                <div className='p-review-scores__track' aria-hidden='true'>
                  <div
                    className={`p-review-scores__fill ${config.modifier}`}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
                {site.url ? (
                  <a
                    className='p-review-scores__value'
                    href={site.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={`${label} ${scoreText}`}
                  >
                    {formatScore(site.score, maxScore)}
                    <span className='p-review-scores__unit'>{unit}</span>
                  </a>
                ) : (
                  <span className='p-review-scores__value'>
                    {formatScore(site.score, maxScore)}
                    <span className='p-review-scores__unit'>{unit}</span>
                  </span>
                )}
              </div>
              <p className='p-review-scores__summary'>{site.summary}</p>
            </li>
          )
        })}
      </ul>
      {formattedDate && (
        <p className='p-review-scores__footer'>
          {locale === 'en'
            ? `${formattedDate} · Check each review site for the latest score.`
            : `${formattedDate} 時点 · 最新スコアは各サイトにてご確認ください`}
        </p>
      )}
    </section>
  )
}
