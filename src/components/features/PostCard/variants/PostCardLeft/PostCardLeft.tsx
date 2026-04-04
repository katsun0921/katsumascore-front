import { PostCard } from '@/components/features/PostCard/PostCard';
import type { PostVariantProps } from '@/components/features/post/types/post';
import './PostCardLeft.scss';

export const PostCardLeft = ({ post, isLoading = false, className }: PostVariantProps) => {
  const classes = ['p-postCardLeft', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {isLoading ? <PostCard isLoading /> : <PostCard post={post} />}
    </div>
  );
};
