import React from 'react'
import './ActorsInfo.scss'

export type TActor = {
  character?: string
  actorName: string
  actorUrl?: string
  description?: string
  otherWorks?: { title: string; href: string; character?: string }[]
}

export type TActorsInfoProps = {
  actors: TActor[]
  locale?: 'ja' | 'en'
}

export const ActorsInfo = ({ actors, locale = 'ja' }: TActorsInfoProps) => {
  if (!actors.length) return null

  return (
    <dl className='p-actors'>
      <dt className='p-actors__label'>{locale === 'en' ? 'Cast' : '登場人物'}</dt>
      {actors.map((actor, i) => (
        <dd key={i} className='p-actors__entry'>
          <dl className='p-actors__detail'>
            {actor.character && (
              <dt className='p-actors__character'>{actor.character}</dt>
            )}
            <dd className='p-actors__actor'>
              <p>
                {locale === 'en' ? 'Actor: ' : '俳優: '}
                {actor.actorUrl ? (
                  <a href={actor.actorUrl} className='p-actors__actor-link'>
                    {actor.actorName}
                  </a>
                ) : (
                  actor.actorName
                )}
              </p>
              {actor.description && (
                <p className='p-actors__description'>{actor.description}</p>
              )}
              {actor.otherWorks && actor.otherWorks.length > 0 && (
                <>
                  <p className='p-actors__other-label'>
                    {locale === 'en' ? 'Other Works:' : '他の作品:'}
                  </p>
                  <ul className='p-actors__other-list'>
                    {actor.otherWorks.map((work, j) => (
                      <li key={j}>
                        <a href={work.href}>
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
        </dd>
      ))}
    </dl>
  )
}
