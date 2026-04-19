import { PostCard } from '@/components/ui/PostCard';
import type { PostCardProps } from '@/components/ui/PostCard';
import './PostCardOverlay.scss';

export const PostCardOverlay = ({ post, isLoading, className }: PostCardProps) => {
  const classes = ['p-postCardOverlay', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <PostCard post={post} isLoading={isLoading} />
    </div>
  );
};
