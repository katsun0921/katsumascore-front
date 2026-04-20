import Link from 'next/link';
import { PostCardContainer } from '@/components/ui-parts/PostCard/PostCardContainer';
import { PostCardMedia } from '@/components/ui-parts/PostCard/PostCardMedia';
import { PostCardBody } from '@/components/ui-parts/PostCard/PostCardBody';
import { PostCardRankBadge } from '@/components/ui-parts/PostCard/PostCardRankBadge';
import type { Post } from '@/types/post';

type Props = {
  post: Post;
  rank?: number;
  className?: string;
};

export const PostCardImgLeft = ({ post, rank, className }: Props) => (
  <PostCardContainer className={className}>
    <Link
      href={post.slug}
      className='relative grid grid-cols-[minmax(120px,30%)_minmax(0,1fr)] items-stretch text-inherit'
    >
      {rank !== undefined && <PostCardRankBadge rank={rank} />}
      <PostCardMedia image={post.image} title={post.title} className='min-h-full' />
      <PostCardBody
        publishedAt={post.publishedAt}
        title={post.title}
        excerpt={post.excerpt}
        className='content-center min-h-full'
      />
    </Link>
  </PostCardContainer>
);
