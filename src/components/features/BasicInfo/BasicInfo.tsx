'use client'

import React from 'react'
import { OfficialSns } from '@/components/features/sidebar/OfficialSns/OfficialSns'
import { t } from '@/i18n/t'
import { messages } from './i18n'
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

export const BasicInfo = ({
  officialUrl,
  copyright,
  releaseDate,
  officialSns,
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
        : `${y}${t(messages, ['date', 'yearSuffix'], locale)}${parseInt(m)}${t(messages, ['date', 'monthSuffix'], locale)}${parseInt(d)}${t(messages, ['date', 'daySuffix'], locale)}`
  }

  const hasSns = officialSns && Object.values(officialSns).some((v) => v?.link)

  const snsPlatformLabel = (platform: string) =>
    platform in messages.snsPlatform
      ? t(messages, ['snsPlatform', platform], locale)
      : platform

  return (
    <dl className='p-basic-info'>
      {officialUrl && (
        <>
          <dt className='p-basic-info__term'>{t(messages, ['terms', 'officialSite'], locale)}</dt>
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
          <dt className='p-basic-info__term'>{t(messages, ['terms', 'officialSns'], locale)}</dt>
          <dd className='p-basic-info__desc'>
            <ul className='p-basic-info__sns-list'>
              {Object.entries(officialSns!).map(([platform, data]) =>
                data?.link ? (
                  <li key={platform} className='p-basic-info__sns-item'>
                    <a href={data.link} target='_blank' rel='noopener noreferrer' className='p-basic-info__link'>
                      {snsPlatformLabel(platform)}
                    </a>
                  </li>
                ) : null
              )}
            </ul>
            <OfficialSns
              snsUrl={officialSns?.x?.link}
              youtubeUrl={officialSns?.youtube_channel?.link}
              instagramUrl={officialSns?.instagram?.link}
              forceVisible
            />
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
          <dt className='p-basic-info__term'>{t(messages, ['terms', 'cast'], locale)}</dt>
          <dd className='p-basic-info__desc p-basic-info__actors'>
            {actors.map((actor, i) => (
              <dl key={i} className='p-basic-info__actor-entry'>
                {actor.character && (
                  <dt className='p-basic-info__actor-character'>{actor.character}</dt>
                )}
                <dd className='p-basic-info__actor-detail'>
                  <p>
                    {t(messages, ['actor', 'labelPrefix'], locale)}
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
                        {t(messages, ['actor', 'otherWorks'], locale)}
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
