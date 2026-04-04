import React from 'react'
import './RelationPost.scss'

export type TRelationPostItem = {
  id: number
  title: string
  href: string
  imageUrl?: string
  imageAlt?: string
}

export type TRelationPostProps = {
  posts: TRelationPostItem[]
  locale?: 'ja' | 'en'
}

export const RelationPost = ({ posts, locale = 'ja' }: TRelationPostProps) => {
  if (!posts.length) return null

  const layoutClass = posts.length === 3 ? 'p-relation-post__list--3col' : 'p-relation-post__list'

  return (
    <section className='p-relation-post'>
      <h2 className='p-relation-post__heading'>
        {locale === 'en' ? 'Related Posts' : '関連ページ'}
      </h2>
      <ul className={layoutClass}>
        {posts.map((post) => (
          <li key={post.id} className='p-relation-post__item'>
            <a className='p-relation-post__link' href={post.href}>
              {post.imageUrl && (
                <div className='p-relation-post__thumb'>
                  <img src={post.imageUrl} alt={post.imageAlt || post.title} />
                </div>
              )}
              <span className='p-relation-post__title'>{post.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
