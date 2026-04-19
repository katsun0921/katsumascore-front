import { PostCard } from '@/components/ui-parts/PostCard';
import type { PostCardProps } from '@/components/ui-parts/PostCard';
import './PostCardLeft.scss';

export const PostCardLeft = ({ post, isLoading, className }: PostCardProps) => {
  const classes = ['p-postCardLeft', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <PostCard post={post} isLoading={isLoading} />
    </div>
  );
};
