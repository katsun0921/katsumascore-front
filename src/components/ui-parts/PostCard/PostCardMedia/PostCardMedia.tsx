import Image from 'next/image';
import type { PostCardMediaProps } from './PostCardMedia.types';
const DEFAULT_SIZES = '(max-width: 768px) 100vw, 540px';

export const PostCardMedia = ({
  image,
  title,
  className,
  sizes = DEFAULT_SIZES,
  priority = false,
  children,
}: PostCardMediaProps) => {
  return (
    <div className={['postCard__media', className].filter(Boolean).join(' ')}>
      {image ? (
        <Image
          src={image}
          alt={`${title}のサムネイル画像`}
          fill
          sizes={sizes}
          priority={priority}
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
      {children}
    </div>
  );
};
