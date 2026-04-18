import { PostCard } from '@/components/features/Post/PostCard/PostCard';
import type { PostVariantProps } from '@/types/post';
import './PostCardTop.scss';

export const PostCardTop = ({ post, isLoading = false, className }: PostVariantProps) => {
  const classes = ['p-postCardTop', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {isLoading ? <PostCard isLoading /> : <PostCard post={post} />}
    </div>
  );
};
