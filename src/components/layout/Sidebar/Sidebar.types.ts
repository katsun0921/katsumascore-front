import type { TRelationPostItem } from '@/components/features/RelationPost/RelationPost'
import type { TStreamingVodEntry } from '@/components/features/StreamingVod/StreamingVod'
import type { TRentalService } from '@/components/features/AdRental/AdRental'
import type { TPostsGroupItem } from '@/components/features/Post/PostsGroup/PostsGroup'
import type { ProfileProps } from '@/components/features/Sidebar/Profile/Profile'
import type { WorkInfoProps } from '@/components/features/Sidebar/WorkInfo/WorkInfo'
import type { AdBannerProps } from '@/components/features/Sidebar/AdBanner/AdBanner'
import type { TocItem } from '@/lib/toc'

export type SidebarProps = {
  locale?: 'ja' | 'en'

  // ❶ プロフィールカード
  profile?: ProfileProps

  // ❷ 作品スコア・基本情報 + VODバッジ
  workInfo?: WorkInfoProps

  // ❸ 目次
  toc?: TocItem[]

  // ❹ 広告バナー（VOD CTA）
  adBanner?: AdBannerProps

  // ❺ 関連記事（サイドバー専用リスト）
  relatedPosts?: import('@/components/features/Sidebar/RelatedPosts/RelatedPosts').RelatedPostItem[]

  // ❼ PICK UP / HIGH SCORE
  pickupPosts?: import('@/components/features/Sidebar/PickUpAndScore/PickUpAndScore').PickUpPost[]
  highScorePosts?: import('@/components/features/Sidebar/PickUpAndScore/PickUpAndScore').PickUpPost[]

  // ❽ ジャンルナビ
  genres?: import('@/components/features/Sidebar/GenreNav/GenreNav').GenreNavTag[]
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
