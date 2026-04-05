import React from 'react'
import './Date.scss'

export type TDateProps = {
  publishedAt: string
  updatedAt?: string
  locale?: 'ja' | 'en'
}

function formatDate(dateStr: string, locale: 'ja' | 'en'): { display: string; datetime: string } {
  const date = new Date(dateStr)
  const datetime = date.toISOString().split('T')[0]
  const display =
    locale === 'en'
      ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  return { display, datetime }
}

export const PostDate = ({ publishedAt, updatedAt, locale = 'ja' }: TDateProps) => {
  const published = formatDate(publishedAt, locale)
  const updated = updatedAt ? formatDate(updatedAt, locale) : null

  return (
    <div className='date'>
      {updated && (
        <p>
          <time dateTime={updated.datetime}>
            {locale === 'en' ? `Last update: ${updated.display}` : `最終更新日: ${updated.display}`}
          </time>
        </p>
      )}
      <p>
        <time dateTime={published.datetime}>
          {locale === 'en' ? `Publication date: ${published.display}` : `公開日: ${published.display}`}
        </time>
      </p>
    </div>
  )
}
