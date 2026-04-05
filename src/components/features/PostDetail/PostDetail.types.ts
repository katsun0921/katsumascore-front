import type { Post } from '@/components/features/post/types/post'
import type { TBasicInfoProps, TCreditEntry } from '@/components/features/BasicInfo/BasicInfo'
import type { TActor } from '@/components/features/ArticleBlock/ActorsInfo/ActorsInfo'
import type { TReviewSite } from '@/components/features/ArticleBlock/ReviewSiteScores/ReviewSiteScores'
import type { TStreamingVodEntry } from '@/components/features/ArticleBlock/StreamingVod/StreamingVod'
import type { TRentalService } from '@/components/features/ArticleBlock/AdRental/AdRental'
import type { TRelationPostItem } from '@/components/features/ArticleBlock/RelationPost/RelationPost'
import type { TPostsGroupItem } from '@/components/features/PostsGroup/PostsGroup'
import type { TVodIntroductionProps } from '@/components/features/VodIntroduction/VodIntroduction'

export type PostDetailData = Post & {
  // コンテンツ
  content: string
  titleEn?: string
  updatedAt?: string

  // p-info ブロック（post-review.php 相当）
  videoCode?: string
  goodPoints?: string[]
  summary?: {
    text: string
    refUrl?: string
    refLabel?: string
  }

  // 基本情報（basic-info + studio-info の統合）
  basicInfo?: Omit<TBasicInfoProps, 'locale'>

  // スタッフ・キャスト（director-info + actors-info）
  credits?: TCreditEntry[]
  actors?: TActor[]

  // 本文後ブロック
  reviewSiteScores?: {
    sites: TReviewSite[]
    publishedDate?: string
  }

  // VOD紹介（post-introduce-vod.php 相当）
  vodIntroduction?: Omit<TVodIntroductionProps, 'locale'>

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
}
