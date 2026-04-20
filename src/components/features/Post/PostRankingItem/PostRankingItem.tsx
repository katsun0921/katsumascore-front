import { PostCardImgOverlay } from '@/components/ui-section/PostCard/PostCardImgOverlay';
import type { PostRankingItemProps } from './PostRankingItem.types';

const COL_CLASS: Record<number, string> = {
  1: 'basis-full',
  2: 'basis-full lg:grow lg:shrink lg:basis-1/2',
  3: 'basis-full lg:grow lg:shrink lg:basis-1/3',
  4: 'basis-full lg:grow lg:shrink lg:basis-1/4',
};

export const PostRankingItem = ({ post, rank, columns = 3, className }: PostRankingItemProps) => (
  <li className={[COL_CLASS[columns] ?? COL_CLASS[3], className].filter(Boolean).join(' ')}>
    <PostCardImgOverlay post={post} rank={rank} />
  </li>
);
