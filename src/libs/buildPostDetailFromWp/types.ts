import type { Post } from "@/types/post";
import type { TRelationPostItem } from "@/components/features/RelationPost";
import type { TPostsGroupItem } from "@/components/features/Post/PostsGroup";

export type BuildPostDetailFromWpInput = {
  wp: unknown;
  locale: string;
  relationPosts?: TRelationPostItem[];
  postsGroups?: TPostsGroupItem[];
  /** taxonomy `vod` が一致する他記事（テーマ post-introduce-vod.php の関連ブロック相当） */
  vodRelatedPosts?: Post[];
};

export type PostsGroupSpec = {
  heading: string;
  description?: string;
  ids: number[];
};
