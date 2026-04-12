import type { Post } from '@/components/features/Post/types/post';

export type PostListProps = {
  posts: Post[];
  isLoading?: boolean;
};
