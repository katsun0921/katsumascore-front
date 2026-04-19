import Image from 'next/image'
import Link from 'next/link'
import { getRankingIcon } from '@/components/features/ScoreWithRank/getRankingIcon'
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'

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
    <div className='p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg'>
      <p className='text-[length:var(--font-size-ui)] font-bold tracking-[0.08em] text-[var(--color-text-primary)] mb-3'>
        {t(messages, ['heading', 'label'], locale)}
      </p>
      <ul className='list-none p-0 m-0 flex flex-col'>
        {posts.slice(0, 5).map((post) => {
          const rank = post.score !== undefined ? getRankingIcon(post.score) : null

          return (
            <li key={post.slug} className='border-t border-[var(--color-border-muted)] first:border-t-0'>
              <Link
                href={post.slug}
                className='flex items-center gap-3 py-3 no-underline text-inherit transition-opacity duration-200 ease hover:opacity-75'
              >
                {/* サムネイル */}
                <div className='flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-[var(--color-surface-muted)]'>
                  {post.thumbnailUrl ? (
                    <Image
                      src={post.thumbnailUrl}
                      alt={t(messages, ['thumbnail', 'alt'], locale)}
                      width={64}
                      height={64}
                      className='w-full h-full object-cover block'
                    />
                  ) : (
                    <div className='w-full h-full bg-[var(--color-bg-muted)]' aria-hidden='true' />
                  )}
                </div>

                {/* テキスト */}
                <div className='flex-1 min-w-0 flex flex-col gap-1'>
                  <span className='text-[length:var(--font-size-caption)] font-semibold leading-[1.5] text-[var(--color-text-primary)] line-clamp-2'>
                    {post.title}
                  </span>
                  {rank && (
                    <Image
                      src={rank.src}
                      alt={`rank ${rank.label}`}
                      width={20}
                      height={20}
                      className='flex-shrink-0 self-start'
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
