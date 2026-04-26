import { Profile } from '@/components/ui-section/Profile'
import { AdBanner } from '@/components/features/AdBanner'
import { RelatedPosts } from '@/components/ui-section/RelatedPosts'
import { PickUpAndScore } from '@/components/features/PickUpAndScore'
import { GenreNav } from '@/components/features/GenreNav'
import { SearchBox } from '@/components/features/SearchBox'
import { RelationPost } from '@/components/features/RelationPost'
import { StreamingVod } from '@/components/features/StreamingVod'
import { AdRental } from '@/components/features/AdRental'
import { PostsGroup } from '@/components/features/Post/PostsGroup'
import { useLocale } from '@/i18n/provider'
import type { SidebarProps } from './Sidebar.types'

export const Sidebar = ({
  profile,
  adBanner,
  relatedPosts,
  pickupPosts = [],
  highScorePosts = [],
  genres,
  activeGenreSlug,
  relationPosts,
  isCinemaShowing,
  titleJp,
  titleEn,
  streamingVods,
  rentalServices,
  postsGroups,
}: SidebarProps) => {
  const locale = useLocale()

  return (
    <aside className='flex flex-col gap-8 w-full px-4'>

      {/* ❶ プロフィールカード */}
      {profile && <Profile {...profile} />}

      {/* ❷ VODバッジ（acf-streaming-vod.php 相当・劇場公開中は非表示） */}
      {!isCinemaShowing && streamingVods && streamingVods.length > 0 && (
        <StreamingVod
          titleJp={titleJp ?? ''}
          titleEn={titleEn}
          services={streamingVods}
        />
      )}

      {/* ❹ レンタル広告（ad-rental.php 相当・劇場公開中・英語は非表示） */}
      {!isCinemaShowing && locale !== 'en' && rentalServices && rentalServices.length > 0 && (
        <AdRental
          title={titleJp ?? ''}
        />
      )}

      {/* ❹ 広告バナー（VOD CTA） */}
      {adBanner && <AdBanner {...adBanner} />}

      {/* ❺ 関連記事（サイドバー専用リスト） */}
      {relatedPosts && relatedPosts.length > 0 && (
        <RelatedPosts posts={relatedPosts} />
      )}

      {/* ❼ PICK UP / HIGH SCORE */}
      <PickUpAndScore pickupPosts={pickupPosts} highScorePosts={highScorePosts} />

      {/* ❽ ジャンルナビ */}
      {genres && genres.length > 0 && (
        <GenreNav tags={genres} activeSlug={activeGenreSlug} />
      )}

      {/* ❾ サイト内検索 */}
      <SearchBox />

      {/* 既存：acf-relation-by-post-id.php 相当（記事本文内グリッド形式） */}
      {relationPosts && relationPosts.length > 0 && (
        <RelationPost posts={relationPosts} />
      )}

      {/* ❼ 関連投稿グループ（PostsGroup 相当） */}
      {postsGroups && postsGroups.length > 0 && (
        <PostsGroup groups={postsGroups} />
      )}
    </aside>
  )
}
