import type { Post } from '@/types/post';

export type PostRankingItemProps = {
  post: Post;
  rank: number;
  className?: string;
};
