import { PostCardListVertical } from '@/components/ui-section/PostCard';
import type { PostCardKind } from '@/components/ui-section/PostCard';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

export type RelatedPostItem = {
  slug: string
  title: string
  thumbnailUrl?: string
  score?: number
}

export type RelatedPostsProps = {
  posts: RelatedPostItem[]
  kind?: PostCardKind
}

export const RelatedPosts = ({ posts, kind }: RelatedPostsProps) => {
  const locale = useLocale();

  if (posts.length === 0) return null;

  return (
    <div className='p-4 bg-color-bg border border-color-border rounded-lg'>
      <p className='text-ui font-bold tracking-[0.08em] text-color-primary mb-3'>
        {t(messages, ['heading', 'label'], locale)}
      </p>
      <PostCardListVertical
        postCardKind={kind}
        posts={posts.slice(0, 5).map((post) => ({
          id: post.slug,
          slug: post.slug,
          title: post.title,
          excerpt: '',
          image: post.thumbnailUrl ?? null,
          publishedAt: '',
          score: post.score,
        }))}
      />
    </div>
  );
};
