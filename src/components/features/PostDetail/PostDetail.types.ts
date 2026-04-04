import type { Post } from '@/components/features/post/types/post';

export type PostDetailProps = {
  post: Post & { content: string };
  relatedPosts?: Post[];
};
