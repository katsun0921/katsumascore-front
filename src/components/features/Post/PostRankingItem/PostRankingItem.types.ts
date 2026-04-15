import type { Post } from '@/components/features/Post/types/post';

export type PostRankingItemProps = {
  post: Post;
  rank: number;
  className?: string;
};
