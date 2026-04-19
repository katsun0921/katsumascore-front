import Link from 'next/link';
import { PostCardContainer } from '@/components/ui-parts/PostCard/PostCardContainer';
import { PostCardMedia } from '@/components/ui-parts/PostCard/PostCardMedia';
import { PostCardBody } from '@/components/ui-parts/PostCard/PostCardBody';
import type { Post } from '@/types/post';

type Props = {
  post: Post;
  className?: string;
};

export const PostCardImgTop = ({ post, className }: Props) => (
  <PostCardContainer className={className}>
    <Link href={post.slug} className='grid text-inherit'>
      <PostCardMedia image={post.image} title={post.title} />
      <PostCardBody
        publishedAt={post.publishedAt}
        title={post.title}
        excerpt={post.excerpt}
      />
    </Link>
  </PostCardContainer>
);
