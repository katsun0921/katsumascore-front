import type { VodService } from '@/libs/vod';
import type { PostType } from '@/libs/route';

export type { VodService } from '@/libs/vod';
export type { PostType } from '@/libs/route';

export type PostTaxonomy = {
  name: string;
  slug: string;
};

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
  genres?: PostTaxonomy[];
  tags?: PostTaxonomy[];
  year?: number;
};

export type PostContentData = {
  content: string;
};

/** フィルタリングと選択肢生成に必要な最小フィールド（allPosts 用） */
export type FilterPost = {
  id: string;
  slug: string;
  score?: number | null;
  publishedAt: string;
  vods?: VodService[] | null;
  genres?: PostTaxonomy[] | null;
  tags?: PostTaxonomy[] | null;
};
