import { PostCard } from '@/components/features/Post/PostCard';
import type { PostCardProps } from '@/components/features/Post/PostCard/PostCard.types';
import './PostCardLeft.scss';

export const PostCardLeft = ({ post, isLoading, className }: PostCardProps) => {
  const classes = ['p-postCardLeft', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <PostCard post={post} isLoading={isLoading} />
    </div>
  );
};
