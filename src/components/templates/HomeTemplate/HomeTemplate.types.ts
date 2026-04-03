import type { Post } from '@/components/features/post/types/post';

export type HomeTemplateProps = {
  posts: Post[];
  isLoading?: boolean;
};
