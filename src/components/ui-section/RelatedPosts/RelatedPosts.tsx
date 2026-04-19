import { PostCardImgLeft } from '@/components/ui-section/PostCard/PostCardImgLeft';
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
      <ul className='list-none p-0 m-0 flex flex-col gap-3'>
        {posts.slice(0, 5).map((post) => (
          <li key={post.slug}>
            <PostCardImgLeft
              post={{
                id: post.slug,
                slug: post.slug,
                title: post.title,
                excerpt: '',
                image: post.thumbnailUrl ?? null,
                publishedAt: '',
                score: post.score,
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
