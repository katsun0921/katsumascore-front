import React from 'react'
import './BasicInfo.scss'

export type TBasicInfoProps = {
  titleEn?: string
  officialUrl?: string
  copyright?: string
  releaseDate?: string
  officialSns?: Record<string, { link?: string }>
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

export const BasicInfo = ({
  titleEn,
  officialUrl,
  copyright,
  releaseDate,
  officialSns,
  locale = 'ja',
}: TBasicInfoProps) => {
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

  const hasSns = officialSns && Object.values(officialSns).some((v) => v?.link)

  return (
    <dl className='p-basic-info'>
      {titleEn && (
        <>
          <dt className='p-basic-info__term'>{locale === 'en' ? 'Title' : '原題'}</dt>
          <dd className='p-basic-info__desc'>{titleEn}</dd>
        </>
      )}
      {officialUrl && (
        <>
          <dt className='p-basic-info__term'>{locale === 'en' ? 'Official Site' : '公式サイト'}</dt>
          <dd className='p-basic-info__desc p-basic-info__desc--break'>
            <a href={officialUrl} target='_blank' rel='noopener noreferrer' className='p-basic-info__link'>
              {officialUrl}
            </a>
            {copyright && <p className='p-basic-info__copyright'>{copyright}</p>}
          </dd>
        </>
      )}
      {hasSns && (
        <>
          <dt className='p-basic-info__term'>{locale === 'en' ? 'Official SNS' : '公式サイトSNS'}</dt>
          <dd className='p-basic-info__desc'>
            <ul className='p-basic-info__sns-list'>
              {Object.entries(officialSns!).map(([platform, data]) =>
                data?.link ? (
                  <li key={platform} className='p-basic-info__sns-item'>
                    <a href={data.link} target='_blank' rel='noopener noreferrer' className='p-basic-info__link'>
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
          <dt className='p-basic-info__term'>
            {locale === 'en' ? 'Screening / Release Date' : '上映日・配信日'}
          </dt>
          <dd className='p-basic-info__desc'>{parsedDate}</dd>
        </>
      )}
    </dl>
  )
}
