import type { Post } from '@/types/post';
import type { TocItem } from '@/libs/toc';
export type PostDetailFranchiseItem = {
  id: number
  title: string
  slug: string
  posts: Post[]
}

import type { TTitleMetaProps, TCreditEntry, TActor } from '@/components/features/Post/PostTitleMeta';
import type { ActorTermEntry } from '@/libs/loadPostDetailPage';
import type { TReviewSite } from '@/components/features/ReviewSiteScores/ReviewSiteScores';
import type { TStreamingVodEntry } from '@/components/features/StreamingVod/StreamingVod';
import type { TRentalService } from '@/components/features/AdRental/AdRental';
import type { TRelationPostItem } from '@/components/features/RelationPost';
import type { TPostsGroupItem } from '@/components/features/Post/PostsGroup/PostsGroup';
import type { TVodIntroductionProps } from '@/components/ui-section/VodIntroduction';
import type { TCinemaIntroductionProps } from '@/components/ui-section/CinemaIntroduction';
import type { ProfileProps } from '@/components/ui-section/Profile';
import type { PickUpPost } from '@/components/features/PickUpAndScore/PickUpAndScore';
import type { GenreNavTag } from '@/components/features/GenreNav/GenreNav';
import type { PostTaxonomyLink } from '@/libs/api/wordpress';

export type PostDetailData = Post & {
  // コンテンツ
  content: string
  updatedAt?: string

  // PostHero 用
  trailerYoutubeId?: string
  trailerEmbedCode?: string
  authorComment?: string
  /** `_embed` の wp:term（genre）から抽出 */
  heroGenres?: PostTaxonomyLink[]
  /** `_embed` の wp:term（post_tag）から抽出 */
  heroTags?: PostTaxonomyLink[]

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

  // 映画紹介（cinema-introduction 相当）
  cinemaIntroduction?: Omit<TCinemaIntroductionProps, 'title' | 'isShowing'>

  // VOD紹介（post-introduce-vod.php 相当）
  vodIntroduction?: TVodIntroductionProps

  // サイドバー用
  profile?: ProfileProps
  toc?: TocItem[]
  pickupPosts?: PickUpPost[]
  highScorePosts?: PickUpPost[]

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

  // 関連フランチャイズ（最大3件ランダム）
  franchises?: PostDetailFranchiseItem[]
}

export type PostDetailProps = {
  post: PostDetailData
  genres?: GenreNavTag[]
  actorTermEntries?: ActorTermEntry[]
  postId?: number
  vodTermId?: number
}
