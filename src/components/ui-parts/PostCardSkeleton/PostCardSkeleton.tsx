import './PostCardSkeleton.scss';

const cx = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(' ');

export type PostCardSkeletonProps = {
  className?: string;
};

export const PostCardSkeleton = ({ className }: PostCardSkeletonProps) => {
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
