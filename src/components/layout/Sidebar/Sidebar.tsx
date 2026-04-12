import { Profile } from '@/components/features/Sidebar/Profile/Profile'
import { WorkInfo } from '@/components/features/Sidebar/WorkInfo/WorkInfo'
import { TableOfContents } from '@/components/ui/TableOfContents/TableOfContents'
import { AdBanner } from '@/components/features/Sidebar/AdBanner/AdBanner'
import { RelatedPosts } from '@/components/features/Sidebar/RelatedPosts/RelatedPosts'
import { PickUpAndScore } from '@/components/features/Sidebar/PickUpAndScore/PickUpAndScore'
import { GenreNav } from '@/components/features/Sidebar/GenreNav/GenreNav'
import { SearchBox } from '@/components/features/Sidebar/SearchBox/SearchBox'
import { RelationPost } from '@/components/features/RelationPost/RelationPost'
import { StreamingVod } from '@/components/features/StreamingVod/StreamingVod'
import { AdRental } from '@/components/features/AdRental/AdRental'
import { PostsGroup } from '@/components/features/Post/PostsGroup/PostsGroup'
import type { SidebarProps } from './Sidebar.types'

export const Sidebar = ({
  locale = 'ja',
  profile,
  workInfo,
  toc,
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
  return (
    <aside className='flex flex-col gap-8 w-full mt-8 md:w-1/4 md:mt-0 md:shrink-0'>

      {/* ❶ プロフィールカード */}
      {profile && <Profile {...profile} />}

      {/* ❷ 作品スコア・基本情報 + VODバッジ */}
      {workInfo && <WorkInfo {...workInfo} />}

      {/* ❸ 目次（sticky） */}
      {toc && toc.length > 0 && <TableOfContents items={toc} />}

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
        <RelationPost posts={relationPosts} locale={locale} />
      )}

      {/* ❷ VODバッジ（acf-streaming-vod.php 相当・劇場公開中は非表示） */}
      {!isCinemaShowing && streamingVods && streamingVods.length > 0 && (
        <StreamingVod
          titleJp={titleJp ?? ''}
          titleEn={titleEn}
          services={streamingVods}
          locale={locale}
        />
      )}

      {/* ❹ レンタル広告（ad-rental.php 相当・劇場公開中・英語は非表示） */}
      {!isCinemaShowing && locale !== 'en' && rentalServices && rentalServices.length > 0 && (
        <AdRental
          titleJp={titleJp ?? ''}
          services={rentalServices}
          locale={locale}
        />
      )}

      {/* ❼ 関連投稿グループ（PostsGroup 相当） */}
      {postsGroups && postsGroups.length > 0 && (
        <PostsGroup groups={postsGroups} />
      )}
    </aside>
  )
}
