import type { Post } from '@/components/features/post/PostCard/PostCard.types';

export type PostListVariant = 'grid' | 'list';

export type PostListProps = {
  posts: Post[];
  isLoading?: boolean;
  variant?: PostListVariant;
};
