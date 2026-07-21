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
  /** WP `modified`（更新日時）。WP正規化以外の生成経路では未設定 */
  updatedAt?: string;
  lang?: "ja" | "en";
  type?: PostType;
  category?: string;
  score?: number;
  isFeatured?: boolean;
  vods?: VodService[];
  genres?: PostTaxonomy[];
  tags?: PostTaxonomy[];
  year?: number;
  /** 記事紹介ショート動画の YouTube 動画 ID（ACF `short_movie.youtube` から抽出。TikTok は現状未対応） */
  shortVideoId?: string;
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
