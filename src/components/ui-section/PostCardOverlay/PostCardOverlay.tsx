import { PostCard } from '@/components/features/Post/PostCard';
import type { PostCardProps } from '@/components/features/Post/PostCard/PostCard.types';
import './PostCardOverlay.scss';

export const PostCardOverlay = ({ post, isLoading, className }: PostCardProps) => {
  const classes = ['p-postCardOverlay', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <PostCard post={post} isLoading={isLoading} />
    </div>
  );
};
