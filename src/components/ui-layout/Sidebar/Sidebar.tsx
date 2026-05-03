import { Profile } from '@/components/ui-section/Profile';
import { AdBanner } from '@/components/ui-section/AdBanner';
import { RelatedPosts } from '@/components/ui-section/RelatedPosts';
import { PickUpAndScore } from '@/components/features/PickUpAndScore';
import { GenreNav } from '@/components/features/GenreNav';
import { SearchBox } from '@/components/features/SearchBox';
import { RelationPost } from '@/components/features/RelationPost';
import { StreamingVod } from '@/components/features/StreamingVod';
import { AdRental } from '@/components/features/AdRental';
import { PostsGroup } from '@/components/features/Post/PostsGroup';
import { useLocale } from '@/i18n/provider';
import type { SidebarProps } from './Sidebar.types';

export const Sidebar = ({
  profile,
  relatedPosts,
  pickupPosts = [],
  highScorePosts = [],
  genres,
  activeGenreSlug,
  relationPosts,
  isCinemaShowing,
  title,
  streamingVods,
  postsGroups,
}: SidebarProps) => {
  const locale = useLocale();

  return (
    <aside className='flex flex-col gap-8 w-full px-4'>

      {/* プロフィールカード */}
      {profile && <Profile {...profile} />}

      {/* VODバッジ（acf-streaming-vod.php 相当・劇場公開中は非表示） */}
      {!isCinemaShowing && streamingVods && streamingVods.length > 0 && (
        <StreamingVod
          title={title ?? ''}
          services={streamingVods}
        />
      )}

      {/* レンタル広告（固定アフィリエイト。劇場公開中・ja以外は非表示） */}
      {!isCinemaShowing && locale === 'ja' && (
        <AdRental
          title={title ?? ''}
        />
      )}

      {/* 固定広告バナー（jaのみ） */}
      {locale === 'ja' && <AdBanner />}

      {/* 関連記事（サイドバー専用リスト） */}
      {relatedPosts && relatedPosts.length > 0 && (
        <RelatedPosts posts={relatedPosts} />
      )}

      {/* PICK UP / HIGH SCORE */}
      <PickUpAndScore pickupPosts={pickupPosts} highScorePosts={highScorePosts} />

      {/* ジャンルナビ */}
      {genres && genres.length > 0 && (
        <GenreNav tags={genres} activeSlug={activeGenreSlug} />
      )}

      {/* サイト内検索 */}
      <SearchBox />

      {relationPosts && relationPosts.length > 0 && (
        <RelationPost posts={relationPosts} />
      )}

      {/* 関連投稿グループ（PostsGroup 相当） */}
      {postsGroups && postsGroups.length > 0 && (
        <PostsGroup groups={postsGroups} />
      )}
    </aside>
  );
};
