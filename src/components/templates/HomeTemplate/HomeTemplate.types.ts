import type { Post } from '@/types/post';
import type { HomeHeroProps } from '@/components/features/HomeHero';
import type { VodFinderItem } from '@/components/ui-home/HomeVodFinder';
import type { ReleaseHighlightBlock } from '@/components/ui-home/HomeReleaseHighlight';
import type { RecommendBlock } from '@/components/ui-home/HomeRecommend';
import type { FeaturedItem } from '@/components/ui-home/HomeFeatured';
import type { CuratedSeriesView } from '@/components/ui-home/HomeCuratedSeries';

/**
 * TOP のキュレーション枠 1 ブロック（表示用に解決済み）。
 * WP の `series` / `franchise` は項目の型が同じため、どちらも `series` として扱う
 * （見出しのリンク先は項目の `href` に解決済み）。
 */
export type HomeCuratedCollection = {
  label: string;
  description: string;
  seeAllHref: string | null;
} & ({ kind: 'posts'; posts: Post[] } | { kind: 'series'; items: CuratedSeriesView[] });

export type HomeTemplateProps = {
  hero: HomeHeroProps;
  rankingPosts: Post[];
  latestPosts: Post[];
  latestSeeAllHref: string;
  animeArchiveHref: string;
  animePosts: Post[];
  highScorePosts: Post[];
  /**
   * 現在劇場公開中の作品（WP `/v1/theater-list` 由来）。0件のときセクションごと出さない。
   * 劇場公開情報は日本語のみの運用のため、`en` のルートでは常に空配列。
   */
  nowShowingPosts: Post[];
  /** 上映中の作品一覧ページ（`/now-showing`）へのリンク */
  nowShowingSeeAllHref: string;
  /** 記事紹介ショート動画付きの投稿（`shortVideoId` を持つもののみ） */
  shortVideoPosts: Post[];
  recommendBlocks: RecommendBlock[];
  vodFinderItems: VodFinderItem[];
  featuredItems: FeaturedItem[];
  /** 編集部が選んだキュレーション枠（WP `/v1/home-curated`）。WP が返した順。0件ならセクションごと出さない */
  curatedCollections: HomeCuratedCollection[];
  /** 直近の劇場公開情報（週次まとめ記事から抽出した作品リスト）。記事が無い場合は undefined */
  theaterReleaseHighlight?: ReleaseHighlightBlock;
  /** 直近のVOD配信情報（週次まとめ記事から抽出した作品リスト）。記事が無い場合は undefined */
  vodReleaseHighlight?: ReleaseHighlightBlock;
};
