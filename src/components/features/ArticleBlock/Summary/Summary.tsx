import React from 'react'
import './Summary.scss'

export type TSummaryProps = {
  text: string
  refUrl?: string
  refLabel?: string
  locale?: 'ja' | 'en'
}

export const Summary = ({ text, refUrl, refLabel, locale = 'ja' }: TSummaryProps) => {
  return (
    <section className='p-summary'>
      <h2 className='p-summary__heading'>{locale === 'en' ? 'Summary' : 'あらすじ'}</h2>
      <blockquote className='p-summary__quote'>
        <p>{text}</p>
        {(refUrl || refLabel) && (
          <cite>
            {refUrl ? (
              <a href={refUrl} target='_blank' rel='noopener noreferrer'>
                {refLabel || refUrl}
              </a>
            ) : (
              refLabel
            )}
          </cite>
        )}
      </blockquote>
    </section>
  )
}
