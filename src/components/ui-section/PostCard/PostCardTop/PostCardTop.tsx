import Link from 'next/link';
import { PostCardContainer } from '@/components/ui-parts/PostCardContainer';
import { PostCardMedia } from '@/components/ui-parts/PostCard/PostCardMedia';
import { PostCardBody } from '@/components/ui-parts/PostCard/PostCardBody';
import type { Post } from '@/types/post';
import './PostCardTop.scss';

type Props = {
  post: Post;
  className?: string;
};

export const PostCardTop = ({ post, className }: Props) => (
  <PostCardContainer className={['postCardTop', className].filter(Boolean).join(' ')}>
    <Link href={post.slug} className='postCardTop__link'>
      <PostCardMedia image={post.image} title={post.title} />
      <PostCardBody
        publishedAt={post.publishedAt}
        title={post.title}
        excerpt={post.excerpt}
      />
    </Link>
  </PostCardContainer>
);
