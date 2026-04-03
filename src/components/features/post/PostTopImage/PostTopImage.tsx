import { PostCard } from '@/components/features/post/PostCard/PostCard';
import type { PostVariantProps } from '@/components/features/post/types/post';
import './PostTopImage.scss';

export const PostTopImage = ({ post, isLoading = false, className }: PostVariantProps) => {
  const classes = ['p-postTopImage', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {isLoading ? <PostCard isLoading /> : <PostCard post={post} />}
    </div>
  );
};
