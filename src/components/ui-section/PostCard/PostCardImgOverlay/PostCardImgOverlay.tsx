import Link from 'next/link';
import { PostCardContainer } from '@/components/ui-parts/PostCard/PostCardContainer';
import { PostCardMedia } from '@/components/ui-parts/PostCard/PostCardMedia';
import { PostCardBody } from '@/components/ui-parts/PostCard/PostCardBody';
import { PostCardRankBadge } from '@/components/ui-parts/PostCard/PostCardRankBadge';
import type { Post } from '@/types/post';
import './PostCardImgOverlay.scss';

type Props = {
  post: Post;
  rank?: number;
  className?: string;
};

export const PostCardImgOverlay = ({ post, rank, className }: Props) => (
  <PostCardContainer className={['postCardImgOverlay', className].filter(Boolean).join(' ')}>
    <Link href={post.slug} className='postCardImgOverlay__link'>
      {rank !== undefined && <PostCardRankBadge rank={rank} />}
      <PostCardMedia image={post.image} title={post.title} />
      <PostCardBody
        publishedAt={post.publishedAt}
        title={post.title}
        excerpt={post.excerpt}
      />
    </Link>
  </PostCardContainer>
);
