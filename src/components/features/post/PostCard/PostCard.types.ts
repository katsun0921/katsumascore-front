export type Post = {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  image: string | null;
  category: string;
  publishedAt: string;
  score?: number;
};

export type PostCardVariant = 'default' | 'compact';

export type PostCardProps = {
  post: Post;
  variant?: PostCardVariant;
  isLoading?: boolean;
};

// Legacy shape kept for the existing post feature components and page data flow.
export type PostCardData = {
  id: number;
  title: string;
  excerpt: string;
  thumbnail: string;
  category?: string;
  score?: '1' | '2' | '3' | '4' | '5';
  publishedAt: string;
  href: string;
};
