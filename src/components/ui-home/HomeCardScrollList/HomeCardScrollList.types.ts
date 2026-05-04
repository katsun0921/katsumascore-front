import type { Post } from '@/types/post';

export type HomeCardScrollListProps = {
  title?: string;
  posts: Post[];
  seeAllHref?: string;
  icon?: 'star' | null;
};
