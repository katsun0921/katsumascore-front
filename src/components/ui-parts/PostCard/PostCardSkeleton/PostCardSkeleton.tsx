import './PostCardSkeleton.scss';

export type PostCardSkeletonProps = {
  className?: string;
};

export const PostCardSkeleton = ({ className }: PostCardSkeletonProps) => {
  const classes = ['postCardSkeleton', className].filter(Boolean).join(' ');
  return (
    <article className={classes} aria-busy='true'>
      <div className='postCardSkeleton__link'>
        <div className='postCardSkeleton__media postCardSkeleton__skeleton' />
        <div className='postCardSkeleton__body'>
          <span className='postCardSkeleton__skeleton postCardSkeleton__skeletonDate' />
          <span className='postCardSkeleton__skeleton postCardSkeleton__skeletonTitle' />
          <span className='postCardSkeleton__skeleton postCardSkeleton__skeletonTitleShort' />
          <span className='postCardSkeleton__skeleton postCardSkeleton__skeletonExcerpt' />
          <span className='postCardSkeleton__skeleton postCardSkeleton__skeletonExcerptShort' />
        </div>
      </div>
    </article>
  );
};
