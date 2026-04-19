import { PostCard } from '@/components/features/Post/PostCard';
import type { PostCardProps } from '@/components/features/Post/PostCard/PostCard.types';
import './PostCardTop.scss';

export const PostCardTop = ({ post, isLoading, className }: PostCardProps) => {
  const classes = ['p-postCardTop', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <PostCard post={post} isLoading={isLoading} />
    </div>
  );
};
