'use client'

import Link from 'next/link'
import { OfficialSns } from '@/components/features/OfficialSns'
import { t } from '@/i18n/t'
import { messages } from './i18n'
import './PostTitleMeta.scss'

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
  otherWorks?: { title: string; href: string; character?: string; score?: number }[]
}

export type TTitleMetaProps = {
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

export const TitleMeta = ({
  officialUrl,
  copyright,
  releaseDate,
  officialSns,
  credits,
  actors,
  locale = 'ja',
}: TTitleMetaProps) => {
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
  const hasCredits = credits && credits.length > 0
  const hasActors = actors && actors.length > 0
  const hasOfficialInfo = officialUrl || hasSns || parsedDate

  return (
    <div className='p-title-meta'>
      {(hasCredits || hasActors) && (
        <div className='p-title-meta__credits-section'>
          <div className='p-title-meta__section-header'>
            <span className='p-title-meta__section-label'>
              {t(messages, ['section', 'creditsAndCast'], locale)}
            </span>
            <div className='p-title-meta__section-line' />
          </div>

          <div className='p-title-meta__credit-stack'>
            {hasCredits && credits.map((entry, i) => (
              <div key={`credit-${i}`} className='p-title-meta__credit-box'>
                <span className='p-title-meta__credit-role'>{entry.role}</span>
                <div className='p-title-meta__credit-name'>{entry.names.join(' / ')}</div>
              </div>
            ))}

            {hasActors && actors.map((actor, i) => (
              <div key={`actor-${i}`} className='p-title-meta__credit-box'>
                {actor.character && (
                  <span className='p-title-meta__credit-role'>{actor.character}</span>
                )}
                <div className='p-title-meta__credit-name'>
                  {actor.actorUrl ? (
                    <Link href={actor.actorUrl} className='p-title-meta__cast-link'>
                      {actor.actorName}
                    </Link>
                  ) : (
                    actor.actorName
                  )}
                </div>
                {actor.description && (
                  <p className='p-title-meta__cast-description'>{actor.description}</p>
                )}
                {actor.otherWorks && actor.otherWorks.length > 0 && (
                  <div className='p-title-meta__works-slider'>
                    {actor.otherWorks.map((work, j) => (
                      <Link key={j} href={work.href} className='p-title-meta__work-card'>
                        <span className='p-title-meta__work-title'>{work.title}</span>
                        {work.score !== undefined && (
                          <span className='p-title-meta__work-score'>{work.score}</span>
                        )}
                        {work.character && (
                          <span className='p-title-meta__work-character'>{work.character}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasOfficialInfo && (
        <div className='p-title-meta__official-section'>
          <div className='p-title-meta__section-header'>
            <span className='p-title-meta__section-label'>
              {t(messages, ['section', 'officialInfo'], locale)}
            </span>
            <div className='p-title-meta__section-line' />
          </div>

          {officialUrl && (
            <div className='p-title-meta__info-block'>
              <div className='p-title-meta__info-title'>
                {t(messages, ['terms', 'officialSite'], locale)}
              </div>
              <a
                href={officialUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='p-title-meta__link-btn'
              >
                {t(messages, ['terms', 'visitSite'], locale)}
              </a>
              {copyright && <p className='p-title-meta__copyright'>{copyright}</p>}
            </div>
          )}

          {hasSns && (
            <div className='p-title-meta__info-block'>
              <div className='p-title-meta__info-title'>
                {t(messages, ['terms', 'officialSns'], locale)}
              </div>
              <OfficialSns
                snsUrl={officialSns?.x?.link}
                youtubeUrl={officialSns?.youtube_channel?.link}
                instagramUrl={officialSns?.instagram?.link}
                forceVisible
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
