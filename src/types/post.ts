import type { VodService } from '@/libs/vod';
import type { PostType } from '@/libs/route';

export type { VodService } from '@/libs/vod';
export type { PostType } from '@/libs/route';

export type Post = {
  id: string;
  slug: string;
  title: string;
  /** メイン `title` と異なる英語表記など（`mapWPPostToPost` が ACF から付与） */
  originalTitle?: string;
  excerpt: string;
  image: string | null;
  publishedAt: string;
  lang?: "ja" | "en";
  type?: PostType;
  category?: string;
  score?: number;
  isFeatured?: boolean;
  vods?: VodService[];
  year?: number;
};

export type PostContentData = {
  content: string;
};
