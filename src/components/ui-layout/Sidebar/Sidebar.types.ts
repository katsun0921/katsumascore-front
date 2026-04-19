import type { TRelationPostItem } from '@/components/features/RelationPost'
import type { TStreamingVodEntry } from '@/components/features/StreamingVod'
import type { TRentalService } from '@/components/features/AdRental'
import type { TPostsGroupItem } from '@/components/features/Post/PostsGroup'
import type { ProfileProps } from '@/components/ui-section/Profile'
import type { AdBannerProps } from '@/components/features/AdBanner'
export type SidebarProps = {
  locale?: 'ja' | 'en'

  // ❶ プロフィールカード
  profile?: ProfileProps

  // ❹ 広告バナー（VOD CTA）
  adBanner?: AdBannerProps

  // ❺ 関連記事（サイドバー専用リスト）
  relatedPosts?: import('@/components/ui-section/RelatedPosts').RelatedPostItem[]

  // ❼ PICK UP / HIGH SCORE
  pickupPosts?: import('@/components/features/PickUpAndScore').PickUpPost[]
  highScorePosts?: import('@/components/features/PickUpAndScore').PickUpPost[]

  // ❽ ジャンルナビ
  genres?: import('@/components/features/GenreNav').GenreNavTag[]
  activeGenreSlug?: string

  // 関連記事（acf-relation-by-post-id.php 相当）
  relationPosts?: TRelationPostItem[]

  // VOD・レンタル（acf-streaming-vod.php / ad-rental.php 相当）
  isCinemaShowing?: boolean
  titleJp?: string
  titleEn?: string
  streamingVods?: TStreamingVodEntry[]
  rentalServices?: TRentalService[]

  // 関連投稿グループ（PostsGroup 相当）
  postsGroups?: TPostsGroupItem[]
}
