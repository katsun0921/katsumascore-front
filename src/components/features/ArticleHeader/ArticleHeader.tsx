import Link from 'next/link'
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
  locale = 'ja',
}: TArticleHeaderProps) => {
  const title = locale === 'en' && titleEn ? titleEn : titleJp
  const published = formatDate(publishedAt, locale)
  const updated = updatedAt ? formatDate(updatedAt, locale) : null

  const bgStyle = imageUrl
    ? { backgroundImage: `url('${imageUrl}')` }
    : undefined

  return (
    <header
      className={`p-article-header${!imageUrl ? ' p-article-header--no-image' : ''}`}
      style={bgStyle}
    >
      {/* 日付：右上に絶対配置（c-date 相当） */}
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

      {/* カテゴリバッジ（c-category 相当） */}
      {categories.length > 0 && (
        <ul className='p-article-header__categories'>
          {categories.map((cat, i) => (
            <li key={i}>
              <Link className='p-article-header__category' href={cat.href}>
                {cat.label}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* タイトル（c-heading__title 相当） */}
      <h1 className='p-article-header__title'>{title}</h1>

      {/* 英語サブタイトル */}
      {titleEn && locale === 'ja' && (
        <p className='p-article-header__subtitle'>{titleEn}</p>
      )}
    </header>
  )
}
