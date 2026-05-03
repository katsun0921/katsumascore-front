import type { VodService } from '@/libs/vod';
import type { PostType } from '@/libs/route';

export type { VodService } from '@/libs/vod';
export type { PostType } from '@/libs/route';

export type Post = {
  id: string;
  slug: string;
  title: string;
  /** 詳細 UI 用の副題（Story / 手組みデータ向け。WP 正規化では未設定） */
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
