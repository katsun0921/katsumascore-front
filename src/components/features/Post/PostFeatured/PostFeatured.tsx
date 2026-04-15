import Image from 'next/image';
import Link from 'next/link';
import type { PostFeaturedProps } from './PostFeatured.types';
import './PostFeatured.scss';

export const PostFeatured = ({ post, className }: PostFeaturedProps) => {
  return (
    <Link href={post.slug} className={['postFeatured', className].filter(Boolean).join(' ')}>
      <div className='postFeatured__media'>
        {post.image ? (
          <Image
            src={post.image}
            alt={`${post.title}のサムネイル画像`}
            fill
            sizes='(max-width: 768px) 100vw, 720px'
            className='postFeatured__image'
          />
        ) : (
          <div className='postFeatured__fallback' role='img' aria-label={`${post.title}の画像はありません`}>
            <span>No Image</span>
          </div>
        )}
        <div className='postFeatured__overlay' aria-hidden='true' />
      </div>

      <div className='postFeatured__body'>
        {post.score !== undefined && (
          <span className='postFeatured__score'>{post.score.toFixed(1)}</span>
        )}
        <h2 className='postFeatured__title'>{post.title}</h2>
        {post.excerpt && (
          <p className='postFeatured__excerpt'>{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
};
