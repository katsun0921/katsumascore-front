import Link from 'next/link';
import { PostCardSkeleton } from '@/components/ui/PostCardSkeleton';
import { PostCardMedia } from '@/components/ui/PostCardMedia';
import { PostCardBody } from '@/components/ui/PostCardBody';
import type { PostCardProps } from './PostCard.types';
import './PostCard.scss';

const cx = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(' ');

export const PostCard = ({ post, isLoading, className }: PostCardProps) => {
  if (isLoading || !post) {
    return <PostCardSkeleton className={className} />;
  }

  return (
    <article className={cx('postCard', className)}>
      <Link href={post.slug} className='postCard__link'>
        <PostCardMedia image={post.image} title={post.title} />
        <PostCardBody
          publishedAt={post.publishedAt}
          title={post.title}
          excerpt={post.excerpt}
        />
      </Link>
    </article>
  );
};
