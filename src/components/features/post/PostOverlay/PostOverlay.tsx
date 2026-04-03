import { PostCard } from '@/components/features/post/PostCard/PostCard';
import type { PostVariantProps } from '@/components/features/post/types/post';
import './PostOverlay.scss';

export const PostOverlay = ({ post, isLoading = false, className }: PostVariantProps) => {
  const classes = ['p-postOverlay', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {isLoading ? <PostCard isLoading /> : <PostCard post={post} />}
    </div>
  );
};
