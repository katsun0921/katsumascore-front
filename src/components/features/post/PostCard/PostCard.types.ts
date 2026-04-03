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
