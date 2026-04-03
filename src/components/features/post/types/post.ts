export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string | null;
  publishedAt: string;
  category?: string;
  score?: number;
};

export type PostContentData = {
  content: string;
};

export type PostVariantProps = {
  post: Post;
  isLoading?: boolean;
  className?: string;
};
