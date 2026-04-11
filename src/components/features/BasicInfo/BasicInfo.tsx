import React from 'react'
import './BasicInfo.scss'

export type TStudioEntry = {
  name: string
  href?: string
}

export type TCreditEntry = {
  role: string
  names: string[]
}

export type TActor = {
  character?: string
  actorName: string
  actorUrl?: string
  description?: string
  otherWorks?: { title: string; href: string; character?: string }[]
}

export type TBasicInfoProps = {
  titleEn?: string
  officialUrl?: string
  copyright?: string
  releaseDate?: string
  officialSns?: Record<string, { link?: string }>
  filmStudios?: TStudioEntry[]
  productionStudios?: TStudioEntry[]
  credits?: TCreditEntry[]
  actors?: TActor[]
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
  officialUrl,
  copyright,
  releaseDate,
  officialSns,
  filmStudios,
  productionStudios,
  credits,
  actors,
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
      {credits && credits.length > 0 && credits.map((entry, i) => (
        <React.Fragment key={i}>
          <dt className='p-basic-info__term'>{entry.role}</dt>
          <dd className='p-basic-info__desc'>{entry.names.join(' / ')}</dd>
        </React.Fragment>
      ))}
      {actors && actors.length > 0 && (
        <>
          <dt className='p-basic-info__term'>{locale === 'en' ? 'Cast' : '登場人物'}</dt>
          <dd className='p-basic-info__desc p-basic-info__actors'>
            {actors.map((actor, i) => (
              <dl key={i} className='p-basic-info__actor-entry'>
                {actor.character && (
                  <dt className='p-basic-info__actor-character'>{actor.character}</dt>
                )}
                <dd className='p-basic-info__actor-detail'>
                  <p>
                    {locale === 'en' ? 'Actor: ' : '俳優: '}
                    {actor.actorUrl ? (
                      <a href={actor.actorUrl} className='p-basic-info__link'>
                        {actor.actorName}
                      </a>
                    ) : (
                      actor.actorName
                    )}
                  </p>
                  {actor.description && (
                    <p className='p-basic-info__actor-description'>{actor.description}</p>
                  )}
                  {actor.otherWorks && actor.otherWorks.length > 0 && (
                    <>
                      <p className='p-basic-info__actor-other-label'>
                        {locale === 'en' ? 'Other Works:' : '他の作品:'}
                      </p>
                      <ul className='p-basic-info__actor-other-list'>
                        {actor.otherWorks.map((work, j) => (
                          <li key={j}>
                            <a href={work.href} className='p-basic-info__link'>
                              {work.title}
                              {work.character && ` (${work.character})`}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </dd>
              </dl>
            ))}
          </dd>
        </>
      )}
    </dl>
  )
}
