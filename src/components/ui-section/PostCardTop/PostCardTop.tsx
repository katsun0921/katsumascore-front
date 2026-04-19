import { PostCard } from '@/components/ui-parts/PostCard';
import type { PostCardProps } from '@/components/ui-parts/PostCard';
import './PostCardTop.scss';

export const PostCardTop = ({ post, isLoading, className }: PostCardProps) => {
  const classes = ['p-postCardTop', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <PostCard post={post} isLoading={isLoading} />
    </div>
  );
};
