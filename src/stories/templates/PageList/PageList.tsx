import React from 'react'
import type { WPPost } from '@/types/wordpress'
import '@/scss/object/template/_pagelist.scss'

export interface PageListProps {
  /** 表示する記事一覧 */
  posts: WPPost[]
  /** 現在のページ番号 */
  currentPage?: number
  /** 総ページ数 */
  totalPages?: number
  /** 表示言語 */
  locale?: 'ja' | 'en'
  /** ページタイトル（カテゴリー名など） */
  title?: string
}

/** 記事ローカライズタイトルを返す */
function getLocalizedTitle(post: WPPost, locale: 'ja' | 'en'): string {
  if (locale === 'en' && post.acf?.title_en) return post.acf.title_en
  return post.acf?.title_jp ?? post.title.rendered
}

/** ACFの release_date（Ymd形式）を YYYY.MM.DD に変換 */
function formatDate(post: WPPost): string {
  const raw = post.acf?.release_date
  if (raw && /^\d{8}$/.test(raw)) {
    return `${raw.slice(0, 4)}.${raw.slice(4, 6)}.${raw.slice(6, 8)}`
  }
  return post.date.split('T')[0].replace(/-/g, '.')
}

export const PageList = ({
  posts,
  currentPage = 1,
  totalPages = 1,
  locale = 'ja',
  title,
}: PageListProps) => {
  return (
    <div className="t-page-list">
      {title && (
        <header className="t-page-list__header">
          <h1 className="t-page-list__title">{title}</h1>
        </header>
      )}

      {posts.length === 0 ? (
        <div className="t-page-list__empty">
          <p className="t-page-list__empty-message">
            {locale === 'en' ? 'No articles found.' : '記事が見つかりませんでした。'}
          </p>
        </div>
      ) : (
        <div className="t-page-list__grid">
          {posts.map((post) => {
            const localizedTitle = getLocalizedTitle(post, locale)
            const thumbnail = post._embedded?.['wp:featuredmedia']?.[0]?.source_url
            const date = formatDate(post)
            const postUrl =
              locale === 'en' ? `/en/posts/${post.slug}` : `/posts/${post.slug}`

            return (
              <article key={post.id} className="t-page-list__card">
                <a href={postUrl} className="t-page-list__card-link">
                  <div className="t-page-list__card-thumbnail">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={localizedTitle}
                        className="t-page-list__card-img"
                      />
                    ) : (
                      <div className="t-page-list__card-no-image">No Image</div>
                    )}
                    {post.acf?.review_score && (
                      <div className="t-page-list__card-score">
                        {post.acf.review_score}
                      </div>
                    )}
                  </div>
                  <div className="t-page-list__card-body">
                    <h2 className="t-page-list__card-title">{localizedTitle}</h2>
                    <time className="t-page-list__card-date">{date}</time>
                  </div>
                </a>
              </article>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="t-page-list__pagination" aria-label="ページネーション">
          {currentPage > 1 && (
            <span className="t-page-list__pagination-item t-page-list__pagination-item--prev">
              &laquo; {locale === 'en' ? 'Prev' : '前へ'}
            </span>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <span
              key={page}
              className={[
                't-page-list__pagination-item',
                page === currentPage
                  ? 't-page-list__pagination-item--active'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {page}
            </span>
          ))}
          {currentPage < totalPages && (
            <span className="t-page-list__pagination-item t-page-list__pagination-item--next">
              {locale === 'en' ? 'Next' : '次へ'} &raquo;
            </span>
          )}
        </nav>
      )}
    </div>
  )
}
