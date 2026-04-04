import React from 'react'
import './GoodPoint.scss'

export type TGoodPointProps = {
  points: string[]
  locale?: 'ja' | 'en'
}

export const GoodPoint = ({ points, locale = 'ja' }: TGoodPointProps) => {
  if (!points.length) return null

  return (
    <section className='p-good-point'>
      <h2 className='p-good-point__heading'>
        {locale === 'en' ? 'I highly recommend this!' : 'ここがおすすめ！'}
      </h2>
      <ul className='p-good-point__list'>
        {points.map((point, i) => (
          <li key={i} className='p-good-point__item'>
            {point}
          </li>
        ))}
      </ul>
    </section>
  )
}
