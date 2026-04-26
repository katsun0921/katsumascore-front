import Link from 'next/link';
import { PostCardMedia } from '@/components/ui-parts/PostCard/PostCardMedia';
import { PostCardBody } from '@/components/ui-parts/PostCard/PostCardBody';
import { ScoreHexBadge } from '@/components/ui-parts/ScoreHexBadge';
import { VodDots } from '@/components/ui-parts/VodDots';
import type { HomeCardProps } from './HomeCard.types';
export const HomeCard = ({ post, className }: HomeCardProps) => {
  return (
    <Link href={post.slug} className={['homeCard', className].filter(Boolean).join(' ')}>
      <PostCardMedia
        image={post.image}
        title={post.title}
        className='homeCard__media'
        sizes='160px'
      >
        {post.score !== undefined && (
          <ScoreHexBadge score={post.score} className='homeCard__score' />
        )}
        {post.vods && post.vods.length > 0 && (
          <VodDots vods={post.vods} className='homeCard__vods' />
        )}
      </PostCardMedia>
      <PostCardBody title={post.title} category={post.category} />
    </Link>
  );
};
