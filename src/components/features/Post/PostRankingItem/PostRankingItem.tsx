import Image from 'next/image';
import Link from 'next/link';
import type { PostRankingItemProps } from './PostRankingItem.types';
import './PostRankingItem.scss';

export const PostRankingItem = ({ post, rank, className }: PostRankingItemProps) => {
  const isTop3 = rank <= 3;

  return (
    <li className={['postRankingItem', className].filter(Boolean).join(' ')}>
      <Link href={post.slug} className='postRankingItem__media'>
        {post.image ? (
          <Image
            src={post.image}
            alt={`${post.title}のサムネイル画像`}
            fill
            sizes='80px'
            className='postRankingItem__image'
          />
        ) : (
          <div className='postRankingItem__fallback' role='img' aria-label={`${post.title}の画像はありません`}>
            <span>No Image</span>
          </div>
        )}
      </Link>

      <div className='postRankingItem__body'>
        <span className={['postRankingItem__rank', isTop3 ? 'postRankingItem__rank--top3' : ''].filter(Boolean).join(' ')}>
          {rank}
        </span>
        {post.score !== undefined && (
          <span className='postRankingItem__score'>{post.score.toFixed(1)}</span>
        )}
        <Link href={post.slug}>
          <h3 className='postRankingItem__title'>{post.title}</h3>
        </Link>
        {post.excerpt && (
          <p className='postRankingItem__excerpt'>{post.excerpt}</p>
        )}
      </div>
    </li>
  );
};
