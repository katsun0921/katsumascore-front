import type { Post } from '@/types/post';

export type PostListVariant = 'grid' | 'row';

export type PostListProps = {
  posts: Post[];
  isLoading?: boolean;
  variant?: PostListVariant;
};
