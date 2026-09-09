import type { Post } from '@/types/post';

export type HomeCardProps = {
  post: Post;
  className?: string;
  scoreBadgePosition?: 'top-left' | 'top-right';
};
