import { PostCard } from '@/components/features/post/PostCard/PostCard';
import type { PostVariantProps } from '@/components/features/post/types/post';
import './PostLeftImage.scss';

export const PostLeftImage = ({ post, isLoading = false, className }: PostVariantProps) => {
  const classes = ['p-postLeftImage', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {isLoading ? <PostCard isLoading /> : <PostCard post={post} />}
    </div>
  );
};
