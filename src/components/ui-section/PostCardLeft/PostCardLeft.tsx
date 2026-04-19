import { PostCard } from '@/components/ui/PostCard';
import type { PostCardProps } from '@/components/ui/PostCard';
import './PostCardLeft.scss';

export const PostCardLeft = ({ post, isLoading, className }: PostCardProps) => {
  const classes = ['p-postCardLeft', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <PostCard post={post} isLoading={isLoading} />
    </div>
  );
};
