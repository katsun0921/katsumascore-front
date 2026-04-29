import type { VodService } from '@/lib/vod';

export type { VodService } from '@/lib/vod';

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string | null;
  publishedAt: string;
  lang?: "ja" | "en";
  category?: string;
  score?: number;
  isFeatured?: boolean;
  vods?: VodService[];
  year?: number;
};

export type PostContentData = {
  content: string;
};
