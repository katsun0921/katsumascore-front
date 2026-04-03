import type { Post } from '@/components/features/post/PostCard/PostCard.types';

export type HomeTemplateProps = {
  posts: Post[];
  isLoading?: boolean;
};
