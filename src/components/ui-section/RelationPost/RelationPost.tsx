import { PostCardImgLeft } from '@/components/ui-section/PostCard/PostCardImgLeft';
import type { RelationPostProps } from './RelationPost.types'

export const RelationPost = ({ heading, posts, layout = 'default' }: RelationPostProps) => {
  const listClassName =
    layout === 'three-column'
      ? 'm-0 grid list-none grid-cols-1 gap-4 p-0 min-[480px]:grid-cols-3'
      : 'm-0 grid list-none grid-cols-1 gap-4 p-0 min-[480px]:grid-cols-2'

  return (
    <section>
      <h2 className='mb-4 text-[length:var(--font-size-h3-lg)] font-[var(--font-weight-bold)] text-[var(--color-text-primary)]'>
        {heading}
      </h2>
      <ul className={listClassName}>
        {posts.map((post) => (
          <li key={post.id}>
            <PostCardImgLeft
              post={{
                id: String(post.id),
                slug: post.href,
                title: post.title,
                excerpt: '',
                image: post.imageUrl ?? null,
                publishedAt: '',
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
