import type { TRelationPostItem } from '@/components/features/RelationPost';
import type { TStreamingVodEntry } from '@/components/features/StreamingVod/StreamingVod';
import type { TRentalService } from '@/components/features/AdRental/AdRental';
import type { TPostsGroupItem } from '@/components/features/Post/PostsGroup/PostsGroup';
import type { ProfileProps } from '@/components/ui-section/Profile';
import type { PickUpPost } from '@/components/features/PickUpAndScore/PickUpAndScore';
import type { GenreNavTag } from '@/components/features/GenreNav/GenreNav';
export type SidebarProps = {
  // ❶ プロフィールカード
  profile?: ProfileProps

  // ❺ 関連記事（サイドバー専用リスト）
  relatedPosts?: import('@/components/ui-section/RelatedPosts').RelatedPostItem[]

  // ❼ PICK UP / HIGH SCORE
  pickupPosts?: PickUpPost[]
  highScorePosts?: PickUpPost[]
  highScoreLoading?: boolean

  // ❽ ジャンルナビ
  genres?: GenreNavTag[]
  activeGenreSlug?: string

  // 関連記事（acf-relation-by-post-id.php 相当）
  relationPosts?: TRelationPostItem[]

  // VOD（acf-streaming-vod.php 相当）・タイトル（レンタル見出し用）
  isCinemaShowing?: boolean
  title?: string
  streamingVods?: TStreamingVodEntry[]
  rentalServices?: TRentalService[]

  // 関連投稿グループ（PostsGroup 相当）
  postsGroups?: TPostsGroupItem[]
}
