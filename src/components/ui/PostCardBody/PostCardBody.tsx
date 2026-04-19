import type { PostCardBodyProps } from './PostCardBody.types';
import './PostCardBody.scss';

export const PostCardBody = ({ publishedAt, title, excerpt }: PostCardBodyProps) => {
  return (
    <div className='postCard__body'>
      <time className='postCard__date' dateTime={publishedAt}>
        {publishedAt}
      </time>
      <h3 className='postCard__title'>{title}</h3>
      <p className='postCard__excerpt'>{excerpt}</p>
    </div>
  );
};
