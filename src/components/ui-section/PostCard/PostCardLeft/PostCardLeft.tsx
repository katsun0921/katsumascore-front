import Link from 'next/link';
import { PostCardContainer } from '@/components/ui-parts/PostCardContainer';
import { PostCardMedia } from '@/components/ui-parts/PostCard/PostCardMedia';
import { PostCardBody } from '@/components/ui-parts/PostCard/PostCardBody';
import type { Post } from '@/types/post';
import './PostCardLeft.scss';

type Props = {
  post: Post;
  className?: string;
};

export const PostCardLeft = ({ post, className }: Props) => (
  <PostCardContainer className={['postCardLeft', className].filter(Boolean).join(' ')}>
    <Link href={post.slug} className='postCardLeft__link'>
      <PostCardMedia image={post.image} title={post.title} />
      <PostCardBody
        publishedAt={post.publishedAt}
        title={post.title}
        excerpt={post.excerpt}
      />
    </Link>
  </PostCardContainer>
);
