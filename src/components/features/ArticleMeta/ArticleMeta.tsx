import React from 'react'
import './ArticleMeta.scss'

export type TArticleMetaProps = {
  releaseDate?: string
  officialUrl?: string
  officialSns?: Record<string, { link?: string }>
  copyright?: string
  titleEn?: string
  locale?: 'ja' | 'en'
}

const SNS_LABELS: Record<string, string> = {
  x: 'X（旧Twitter）',
  instagram: 'Instagram',
  youtube_channel: 'YouTube Channel',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  line: 'LINE',
}

export const ArticleMeta = ({
  releaseDate,
  officialUrl,
  officialSns,
  copyright,
  titleEn,
  locale = 'ja',
}: TArticleMetaProps) => {
  const hasSns =
    officialSns &&
    Object.values(officialSns).some((v) => v?.link)

  let parsedDate: string | null = null
  if (releaseDate && releaseDate.length === 8) {
    const y = releaseDate.slice(0, 4)
    const m = releaseDate.slice(4, 6)
    const d = releaseDate.slice(6, 8)
    parsedDate =
      locale === 'en'
        ? new Date(`${y}-${m}-${d}`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : `${y}年${parseInt(m)}月${parseInt(d)}日`
  }

  return (
    <dl className='p-article-meta'>
      {titleEn && (
        <>
          <dt className='p-article-meta__label'>{locale === 'en' ? 'Title' : '原題'}</dt>
          <dd className='p-article-meta__value'>{titleEn}</dd>
        </>
      )}
      {officialUrl && (
        <>
          <dt className='p-article-meta__label'>{locale === 'en' ? 'Official Site' : '公式サイト'}</dt>
          <dd className='p-article-meta__value'>
            <a href={officialUrl} target='_blank' rel='noopener noreferrer' className='p-article-meta__link'>
              {officialUrl}
            </a>
            {copyright && <p className='p-article-meta__copyright'>{copyright}</p>}
          </dd>
        </>
      )}
      {hasSns && (
        <>
          <dt className='p-article-meta__label'>{locale === 'en' ? 'Official SNS' : '公式SNS'}</dt>
          <dd className='p-article-meta__value'>
            <ul className='p-article-meta__sns-list'>
              {Object.entries(officialSns!).map(([platform, data]) =>
                data?.link ? (
                  <li key={platform}>
                    <a href={data.link} target='_blank' rel='noopener noreferrer' className='p-article-meta__link'>
                      {SNS_LABELS[platform] || platform}
                    </a>
                  </li>
                ) : null
              )}
            </ul>
          </dd>
        </>
      )}
      {parsedDate && (
        <>
          <dt className='p-article-meta__label'>
            {locale === 'en' ? 'Release Date' : '上映日・配信日'}
          </dt>
          <dd className='p-article-meta__value'>{parsedDate}</dd>
        </>
      )}
    </dl>
  )
}
