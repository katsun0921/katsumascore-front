import type { VodService } from '@/lib/vod';

export type { VodService } from '@/lib/vod';

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string | null;
  publishedAt: string;
  category?: string;
  score?: number;
  vods?: VodService[];
  year?: number;
};

export type PostContentData = {
  content: string;
};
