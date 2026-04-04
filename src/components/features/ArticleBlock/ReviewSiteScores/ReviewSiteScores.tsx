import React from 'react'
import './ReviewSiteScores.scss'

export type TReviewSite = {
  label: string
  score: number
  maxScore: number
  url?: string
  audienceScore?: number
}

export type TReviewSiteScoresProps = {
  sites: TReviewSite[]
  locale?: 'ja' | 'en'
  publishedDate?: string
}

export const ReviewSiteScores = ({ sites, locale = 'ja', publishedDate }: TReviewSiteScoresProps) => {
  const validSites = sites.filter((s) => s.score > 0)
  if (!validSites.length) return null

  const average =
    validSites.reduce((sum, s) => sum + (s.score / s.maxScore) * 10, 0) / validSites.length

  return (
    <section className='p-review-scores'>
      <h2 className='p-review-scores__heading'>
        {locale === 'en' ? 'Review Site Scores' : '各サイトのレビュースコア'}
      </h2>
      <ul className='p-review-scores__list'>
        {validSites.map((site, i) => {
          const normalizedPct = (site.score / site.maxScore) * 100
          return (
            <li key={i} className='p-review-scores__item'>
              <a
                className='p-review-scores__link'
                href={site.url}
                target='_blank'
                rel='noopener noreferrer'
              >
                <span className='p-review-scores__site-name'>{site.label}</span>
                <span className='p-review-scores__score'>
                  {site.score}/{site.maxScore}
                </span>
                {site.audienceScore != null && (
                  <span className='p-review-scores__audience'>
                    AUDIENCE: {site.audienceScore}/{site.maxScore}
                  </span>
                )}
              </a>
              <div className='p-review-scores__bar'>
                <div
                  className='p-review-scores__bar-fill'
                  style={{ width: `${normalizedPct}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
      <p className='p-review-scores__average'>
        {locale === 'en' ? 'Average' : '平均'}: {average.toFixed(1)}/10
      </p>
      {publishedDate && (
        <p className='p-review-scores__note'>
          {locale === 'en'
            ? `Information current as of ${publishedDate}. Check each site for latest scores.`
            : `本ページの情報は${publishedDate}時点のものです。各サイトの最新スコアは各々のサイトにてご確認ください。`}
        </p>
      )}
    </section>
  )
}
