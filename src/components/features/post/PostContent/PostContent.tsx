import type { PostContentData } from '@/components/features/post/types/post';
import './PostContent.scss';

export const PostContent = ({ content }: PostContentData) => {
  return (
    <div
      className='p-content'
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
