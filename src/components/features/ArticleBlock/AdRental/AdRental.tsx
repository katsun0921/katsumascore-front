import React from 'react'
import './AdRental.scss'

export type TRentalService = {
  service: 'tsutaya' | 'geo' | string
  url: string
}

export type TAdRentalProps = {
  titleJp: string
  services: TRentalService[]
  locale?: 'ja' | 'en'
}

const SERVICE_LABELS: Record<string, string> = {
  tsutaya: 'TSUTAYA',
  geo: 'GEO',
}

export const AdRental = ({ titleJp, services, locale = 'ja' }: TAdRentalProps) => {
  const active = services.filter((s) => s.url)
  if (!active.length) return null

  return (
    <div className='p-ad-rental'>
      <h2 className='p-ad-rental__heading'>
        {locale === 'en'
          ? `${titleJp} is available for rental.`
          : `${titleJp}はレンタルサービスでレンタル中です。`}
      </h2>
      <ul className='p-ad-rental__list'>
        {active.map((s, i) => (
          <li key={i} className='p-ad-rental__item'>
            <a
              className={['p-ad-rental__link', `p-ad-rental__link--${s.service}`].join(' ')}
              href={s.url}
              target='_blank'
              rel='noopener noreferrer'
            >
              {SERVICE_LABELS[s.service] || s.service}
              <span>{locale === 'en' ? 'Rent here' : 'レンタルはこちら'}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
