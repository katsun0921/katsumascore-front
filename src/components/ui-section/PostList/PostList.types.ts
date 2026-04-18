import type { Post } from '@/types/post';

export type PostListProps = {
  posts: Post[];
  isLoading?: boolean;
};
