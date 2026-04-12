import type { Post } from '@/components/features/Post/types/post';

type LoadedPostCardProps = {
  post: Post;
  className?: string;
  isLoading?: false;
};

type LoadingPostCardProps = {
  post?: never;
  className?: string;
  isLoading: true;
};

export type PostCardProps = LoadedPostCardProps | LoadingPostCardProps;
