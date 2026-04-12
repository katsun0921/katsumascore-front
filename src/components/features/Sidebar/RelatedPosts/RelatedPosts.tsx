import Image from 'next/image'
import Link from 'next/link'
import { getRankingIcon } from '@/components/features/Score/ScoreWithRank/getRankingIcon'
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'
import './RelatedPosts.scss'

export type RelatedPostItem = {
  slug: string
  title: string
  thumbnailUrl?: string
  score?: number
}

export type RelatedPostsProps = {
  posts: RelatedPostItem[]
}

export const RelatedPosts = ({ posts }: RelatedPostsProps) => {
  const locale = useLocale()

  if (posts.length === 0) return null

  return (
    <div className='sidebar-related'>
      <p className='sidebar-related__heading'>
        {t(messages, ['heading', 'label'], locale)}
      </p>
      <ul className='sidebar-related__list'>
        {posts.slice(0, 5).map((post) => {
          const rank = post.score !== undefined ? getRankingIcon(post.score) : null

          return (
            <li key={post.slug} className='sidebar-related__item'>
              <Link href={post.slug} className='sidebar-related__link'>
                {/* サムネイル */}
                <div className='sidebar-related__thumb'>
                  {post.thumbnailUrl ? (
                    <Image
                      src={post.thumbnailUrl}
                      alt={t(messages, ['thumbnail', 'alt'], locale)}
                      width={64}
                      height={64}
                      className='sidebar-related__thumb-img'
                    />
                  ) : (
                    <div className='sidebar-related__thumb-fallback' aria-hidden='true' />
                  )}
                </div>

                {/* テキスト */}
                <div className='sidebar-related__body'>
                  <span className='sidebar-related__title'>{post.title}</span>
                  {rank && (
                    <img
                      src={rank.src}
                      alt={`rank ${rank.label}`}
                      width={20}
                      height={20}
                      className='sidebar-related__rank'
                    />
                  )}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
