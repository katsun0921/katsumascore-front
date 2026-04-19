import Image from 'next/image';
import Link from 'next/link';
import type { PostCardProps } from './PostCard.types';
import './PostCard.scss';

const cx = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(' ');

const PostCardSkeleton = ({ className }: Pick<PostCardProps, 'className'>) => {
  return (
    <article className={cx('postCard', 'is-loading', className)} aria-busy='true'>
      <div className='postCard__link'>
        <div className='postCard__media postCard__skeleton' />
        <div className='postCard__body'>
          <span className='postCard__date postCard__skeleton postCard__skeletonDate' />
          <span className='postCard__title postCard__skeleton postCard__skeletonTitle' />
          <span className='postCard__title postCard__skeleton postCard__skeletonTitleShort' />
          <span className='postCard__excerpt postCard__skeleton postCard__skeletonExcerpt' />
          <span className='postCard__excerpt postCard__skeleton postCard__skeletonExcerptShort' />
        </div>
      </div>
    </article>
  );
};

export const PostCard = ({ post, isLoading, className }: PostCardProps) => {
  if (isLoading || !post) {
    return <PostCardSkeleton className={className} />;
  }

  const imageAlt = `${post.title}のサムネイル画像`;

  return (
    <article className={cx('postCard', className)}>
      <Link href={post.slug} className='postCard__link'>
        <div className='postCard__media'>
          {post.image ? (
            <Image
              src={post.image}
              alt={imageAlt}
              fill
              sizes='(max-width: 768px) 100vw, 540px'
              className='postCard__image'
            />
          ) : (
            <div
              className='postCard__fallback'
              role='img'
              aria-label={`${post.title}の画像はありません`}
            >
              <span className='postCard__fallbackLabel'>No Image</span>
            </div>
          )}
        </div>

        <div className='postCard__body'>
          <time className='postCard__date' dateTime={post.publishedAt}>
            {post.publishedAt}
          </time>
          <h3 className='postCard__title'>{post.title}</h3>
          <p className='postCard__excerpt'>{post.excerpt}</p>
        </div>
      </Link>
    </article>
  );
};
