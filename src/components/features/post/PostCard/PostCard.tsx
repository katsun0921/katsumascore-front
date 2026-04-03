import Image from 'next/image';
import Link from 'next/link';
import type { PostCardProps } from './PostCard.types';
import './PostCard.scss';

const cx = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(' ');

const PostCardSkeleton = ({ className }: Pick<PostCardProps, 'className'>) => {
  return (
    <article className={cx('c-postCard', 'is-loading', className)} aria-busy='true'>
      <div className='c-postCard__link'>
        <div className='c-postCard__media c-postCard__skeleton' />
        <div className='c-postCard__body'>
          <span className='c-postCard__date c-postCard__skeleton c-postCard__skeletonDate' />
          <span className='c-postCard__title c-postCard__skeleton c-postCard__skeletonTitle' />
          <span className='c-postCard__title c-postCard__skeleton c-postCard__skeletonTitleShort' />
          <span className='c-postCard__excerpt c-postCard__skeleton c-postCard__skeletonExcerpt' />
          <span className='c-postCard__excerpt c-postCard__skeleton c-postCard__skeletonExcerptShort' />
        </div>
      </div>
    </article>
  );
};

export const PostCard = (props: PostCardProps) => {
  if (props.isLoading) {
    return <PostCardSkeleton className={props.className} />;
  }

  const { post, className } = props;
  const imageAlt = `${post.title}のサムネイル画像`;

  return (
    <article className={cx('c-postCard', className)}>
      <Link href={post.slug} className='c-postCard__link'>
        <div className='c-postCard__media'>
          {post.image ? (
            <Image
              src={post.image}
              alt={imageAlt}
              fill
              sizes='(max-width: 768px) 100vw, 540px'
              className='c-postCard__image'
            />
          ) : (
            <div
              className='c-postCard__fallback'
              role='img'
              aria-label={`${post.title}の画像はありません`}
            >
              <span className='c-postCard__fallbackLabel'>No Image</span>
            </div>
          )}
        </div>

        <div className='c-postCard__body'>
          <time className='c-postCard__date' dateTime={post.publishedAt}>
            {post.publishedAt}
          </time>
          <h3 className='c-postCard__title'>{post.title}</h3>
          <p className='c-postCard__excerpt'>{post.excerpt}</p>
        </div>
      </Link>
    </article>
  );
};
