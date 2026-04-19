import type { Post } from '@/types/post';

export type PostCardProps = {
  post?: Post;
  className?: string;
  isLoading?: boolean;
};
