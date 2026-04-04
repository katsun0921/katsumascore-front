import React from 'react'
import './ArticleHeader.scss'

export type TArticleHeaderProps = {
  titleJp: string
  titleEn?: string
  publishedAt: string
  updatedAt?: string
  categories?: { label: string; href: string }[]
  imageUrl?: string
  imageAlt?: string
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

export const ArticleHeader = ({
  titleJp,
  titleEn,
  publishedAt,
  updatedAt,
  categories = [],
  imageUrl,
  imageAlt,
  locale = 'ja',
}: TArticleHeaderProps) => {
  const title = locale === 'en' && titleEn ? titleEn : titleJp
  const published = formatDate(publishedAt, locale)
  const updated = updatedAt ? formatDate(updatedAt, locale) : null

  return (
    <header className='p-article-header'>
      {categories.length > 0 && (
        <ul className='p-article-header__categories'>
          {categories.map((cat, i) => (
            <li key={i}>
              <a className='p-article-header__category' href={cat.href}>
                {cat.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      <h1 className='p-article-header__title'>{title}</h1>
      {titleEn && locale === 'ja' && (
        <p className='p-article-header__subtitle'>{titleEn}</p>
      )}
      <div className='p-article-header__meta'>
        {updated && (
          <time className='p-article-header__date' dateTime={updated.datetime}>
            {locale === 'en' ? `Updated: ${updated.display}` : `更新: ${updated.display}`}
          </time>
        )}
        <time className='p-article-header__date' dateTime={published.datetime}>
          {locale === 'en' ? `Published: ${published.display}` : `公開: ${published.display}`}
        </time>
      </div>
      {imageUrl && (
        <div className='p-article-header__image'>
          <img src={imageUrl} alt={imageAlt || title} />
        </div>
      )}
    </header>
  )
}
