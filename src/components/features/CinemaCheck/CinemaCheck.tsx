import React from 'react'
import './CinemaCheck.scss'

export type TCinemaCheckProps = {
  isCinemaShowing: boolean
  titleJp?: string
  locale?: 'ja' | 'en'
}

export const CinemaCheck = ({ isCinemaShowing, titleJp, locale = 'ja' }: TCinemaCheckProps) => {
  if (!isCinemaShowing) return null

  const message =
    locale === 'en'
      ? `${titleJp || 'This title'} is currently showing in theaters.`
      : `${titleJp || 'この作品'}は現在劇場公開中です。`

  return (
    <div className='p-cinema-check'>
      <span className='p-cinema-check__badge'>
        {locale === 'en' ? 'Now in Theaters' : '劇場公開中'}
      </span>
      <p className='p-cinema-check__message'>{message}</p>
    </div>
  )
}
