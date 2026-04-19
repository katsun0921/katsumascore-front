import Link from 'next/link';
import { PostCardContainer } from '@/components/ui-parts/PostCard/PostCardContainer';
import { PostCardMedia } from '@/components/ui-parts/PostCard/PostCardMedia';
import { PostCardBody } from '@/components/ui-parts/PostCard/PostCardBody';
import type { Post } from '@/types/post';

type Props = {
  post: Post;
  className?: string;
};

export const PostCardImgLeft = ({ post, className }: Props) => (
  <PostCardContainer className={className}>
    <Link
      href={post.slug}
      className='grid grid-cols-[minmax(120px,30%)_minmax(0,1fr)] items-stretch text-inherit'
    >
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
