import { PostCard } from '@/components/features/Post/PostCard';
import type { PostVariantProps } from '@/types/post';
import './PostCardOverlay.scss';

export const PostCardOverlay = ({ post, isLoading = false, className }: PostVariantProps) => {
  const classes = ['p-postCardOverlay', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {isLoading ? <PostCard isLoading /> : <PostCard post={post} />}
    </div>
  );
};
