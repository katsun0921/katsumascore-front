import type { PostCardKind } from '@/components/ui-section/PostCard';
import { PostCardListVertical } from '@/components/ui-section/PostCard';
import type { RelationPostProps } from './RelationPost.types';

export const RelationPost = ({ heading, posts, kind }: RelationPostProps) => {
  const postKind: PostCardKind = 'imgOver';
  return (
    <section>
      <h2 className='mb-4 text-[var(--font-size-h3-lg)] font-[var(--font-weight-bold)] text-color-primary'>
        {heading}
      </h2>
      <PostCardListVertical
        postCardKind={postKind}
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
  );
};
