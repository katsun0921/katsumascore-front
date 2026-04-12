import type { Post } from '@/components/features/Post/types/post'
import type { TocItem } from '@/lib/toc'
import type { TTitleMetaProps, TCreditEntry, TActor } from '@/components/features/Post/PostTitleMeta/PostTitleMeta'
import type { TReviewSite } from '@/components/features/ReviewSiteScores/ReviewSiteScores'
import type { TStreamingVodEntry } from '@/components/features/StreamingVod/StreamingVod'
import type { TRentalService } from '@/components/features/AdRental/AdRental'
import type { TRelationPostItem } from '@/components/features/RelationPost/RelationPost'
import type { TPostsGroupItem } from '@/components/features/Post/PostsGroup/PostsGroup'
import type { TVodIntroductionProps } from '@/components/features/VodIntroduction/VodIntroduction'
import type { ProfileProps } from '@/components/features/Sidebar/Profile/Profile'

export type PostDetailData = Post & {
  // コンテンツ
  content: string
  titleEn?: string
  updatedAt?: string

  // PostHeader 用メタ情報
  rating?: string

  // PostHero 用
  trailerYoutubeId?: string
  trailerEmbedCode?: string
  authorComment?: string

  // p-info ブロック（post-review.php 相当）
  videoCode?: string
  goodPoints?: string[]
  summary?: {
    text: string
    refUrl?: string
    refLabel?: string
  }

  // 基本情報（basic-info + studio-info の統合）
  TitleMeta?: Omit<TTitleMetaProps, 'locale'>

  // スタッフ・キャスト（director-info + actors-info）
  credits?: TCreditEntry[]
  actors?: TActor[]

  // 本文後ブロック
  reviewSiteScores?: {
    sites: TReviewSite[]
    updatedAt?: string
    publishedDate?: string
  }

  // VOD紹介（post-introduce-vod.php 相当）
  vodIntroduction?: Omit<TVodIntroductionProps, 'locale'>

  // サイドバー用
  profile?: ProfileProps
  toc?: TocItem[]
  pickupPosts?: import('@/components/features/Sidebar/PickUpAndScore/PickUpAndScore').PickUpPost[]
  highScorePosts?: import('@/components/features/Sidebar/PickUpAndScore/PickUpAndScore').PickUpPost[]

  // aside ブロック群
  isCinemaShowing?: boolean
  streamingVods?: TStreamingVodEntry[]
  rentalServices?: TRentalService[]

  // 関連投稿 ID ベース（acf-relation-by-post-id.php 相当）
  relationPosts?: TRelationPostItem[]

  // PostsGroup で束ねる関連投稿群
  // 関連ACFグループ / シリーズ / カテゴリ / タグ
  postsGroups?: TPostsGroupItem[]

  // シェアボタン用
  shareUrl?: string
}

export type PostDetailProps = {
  post: PostDetailData
  locale?: 'ja' | 'en'
  genres?: import('@/components/features/Sidebar/GenreNav/GenreNav').GenreNavTag[]
}
