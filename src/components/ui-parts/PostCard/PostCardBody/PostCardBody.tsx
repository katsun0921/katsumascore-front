import type { PostCardBodyProps } from './PostCardBody.types';
import './PostCardBody.scss';

export const PostCardBody = ({ publishedAt, title, excerpt, className }: PostCardBodyProps) => {
  return (
    <div className={['postCard__body grid gap-3 px-4 pb-5 pt-4 md:p-5', className].filter(Boolean).join(' ')}>
      <time className='postCard__date' dateTime={publishedAt}>
        {publishedAt}
      </time>
      <h3 className='postCard__title'>{title}</h3>
      <p className='postCard__excerpt'>{excerpt}</p>
    </div>
  );
};
