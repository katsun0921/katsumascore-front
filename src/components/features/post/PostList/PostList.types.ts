import type { Post } from '@/components/features/post/types/post';

export type PostListVariant = 'grid' | 'list';

export type PostListProps = {
  posts: Post[];
  isLoading?: boolean;
  variant?: PostListVariant;
};
