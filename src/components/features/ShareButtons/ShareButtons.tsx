import React from 'react'
import './ShareButtons.scss'

export type TShareButtonsProps = {
  url: string
  title: string
  locale?: 'ja' | 'en'
}

export const ShareButtons = ({ url, title, locale = 'ja' }: TShareButtonsProps) => {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const label = locale === 'en' ? 'Share' : 'シェア'

  return (
    <div className='p-share-buttons'>
      <p className='p-share-buttons__label'>{label}</p>
      <ul className='p-share-buttons__list'>
        <li>
          <a
            className='p-share-buttons__btn p-share-buttons__btn--x'
            href={`https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='X（Twitter）でシェア'
          >
            X
          </a>
        </li>
        <li>
          <a
            className='p-share-buttons__btn p-share-buttons__btn--facebook'
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Facebookでシェア'
          >
            Facebook
          </a>
        </li>
        <li>
          <a
            className='p-share-buttons__btn p-share-buttons__btn--line'
            href={`https://line.me/R/msg/text/?${encodedTitle}%0D%0A${encodedUrl}`}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='LINEでシェア'
          >
            LINE
          </a>
        </li>
      </ul>
    </div>
  )
}
