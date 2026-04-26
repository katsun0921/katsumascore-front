import { PostCardListVertical } from '@/components/ui-section/PostCard';
import type { RelationPostProps } from './RelationPost.types'

export const RelationPost = ({ heading, posts, kind }: RelationPostProps) => {

  return (
    <section>
      <h2 className='mb-4 text-[length:var(--font-size-h3-lg)] font-[var(--font-weight-bold)] text-[var(--color-text-primary)]'>
        {heading}
      </h2>
      <PostCardListVertical
        postCardKind={kind}
        posts={posts.map((post) => ({
          id: String(post.id),
          slug: post.href,
          title: post.title,
          excerpt: '',
          image: post.imageUrl ?? null,
          publishedAt: '',
        }))}
      />
    </section>
  )
}
