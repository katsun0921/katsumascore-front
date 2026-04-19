import Image from 'next/image';
import type { PostCardMediaProps } from './PostCardMedia.types';
import './PostCardMedia.scss';

export const PostCardMedia = ({ image, title }: PostCardMediaProps) => {
  return (
    <div className='postCard__media'>
      {image ? (
        <Image
          src={image}
          alt={`${title}のサムネイル画像`}
          fill
          sizes='(max-width: 768px) 100vw, 540px'
          className='postCard__image'
        />
      ) : (
        <div
          className='postCard__fallback'
          role='img'
          aria-label={`${title}の画像はありません`}
        >
          <span className='postCard__fallbackLabel'>No Image</span>
        </div>
      )}
    </div>
  );
};
