import React from 'react'
import './CreditInfo.scss'

export type TCreditEntry = {
  role: string
  names: string[]
}

export type TCreditInfoProps = {
  credits: TCreditEntry[]
  locale?: 'ja' | 'en'
}

export const CreditInfo = ({ credits, locale = 'ja' }: TCreditInfoProps) => {
  if (!credits.length) return null

  return (
    <section className='p-credit-info'>
      <h2 className='p-credit-info__heading'>
        {locale === 'en' ? 'Credits' : 'スタッフ'}
      </h2>
      <dl className='p-credit-info__list'>
        {credits.map((entry, i) => (
          <React.Fragment key={i}>
            <dt className='p-credit-info__role'>{entry.role}</dt>
            <dd className='p-credit-info__names'>
              {entry.names.join(' / ')}
            </dd>
          </React.Fragment>
        ))}
      </dl>
    </section>
  )
}
