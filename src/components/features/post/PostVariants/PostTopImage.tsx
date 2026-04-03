import { PostCard } from '@/components/features/post/PostCard/PostCard';
import type { PostVariantProps } from '@/components/features/post/types/post';
import './PostVariants.scss';

const cx = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(' ');

export const PostTopImage = ({ post, isLoading = false, className }: PostVariantProps) => {
  return (
    <div className={cx('p-postVariant', 'p-postVariant--top', className)}>
      {isLoading ? <PostCard isLoading /> : <PostCard post={post} />}
    </div>
  );
};
