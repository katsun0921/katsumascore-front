import type { PostCardBodyProps } from './PostCardBody.types';
export const PostCardBody = ({
  publishedAt,
  title,
  excerpt,
  category,
  className,
}: PostCardBodyProps) => {
  return (
    <div className={['postCard__body grid gap-3 px-4 pb-5 pt-4 md:p-5', className].filter(Boolean).join(' ')}>
      {publishedAt && (
        <time className='postCard__date' dateTime={publishedAt}>
          {publishedAt}
        </time>
      )}
      <h3 className='postCard__title'>{title}</h3>
      {excerpt && <p className='postCard__excerpt'>{excerpt}</p>}
      {category && <p className='postCard__category'>{category}</p>}
    </div>
  );
};
