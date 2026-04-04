import type { Post } from '@/components/features/post/types/post';

export type PostListProps = {
  posts: Post[];
  isLoading?: boolean;
};
