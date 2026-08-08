import type { Post } from '@/types/post';
import type { HomeHeroProps } from '@/components/features/HomeHero';
import type { VodFinderItem } from '@/components/ui-home/HomeVodFinder';
import type { ReleaseHighlightBlock } from '@/components/ui-home/HomeReleaseHighlight';
import type { RecommendBlock } from '@/components/ui-home/HomeRecommend';
import type { FeaturedItem } from '@/components/ui-home/HomeFeatured';

export type HomeTemplateProps = {
  hero: HomeHeroProps;
  rankingPosts: Post[];
  latestPosts: Post[];
  latestSeeAllHref: string;
  animeArchiveHref: string;
  animePosts: Post[];
  highScorePosts: Post[];
  /** 記事紹介ショート動画付きの投稿（`shortVideoId` を持つもののみ） */
  shortVideoPosts: Post[];
  recommendBlocks: RecommendBlock[];
  vodFinderItems: VodFinderItem[];
  featuredItems: FeaturedItem[];
  /** 直近の劇場公開情報（週次まとめ記事から抽出した作品リスト）。記事が無い場合は undefined */
  theaterReleaseHighlight?: ReleaseHighlightBlock;
  /** 直近のVOD配信情報（週次まとめ記事から抽出した作品リスト）。記事が無い場合は undefined */
  vodReleaseHighlight?: ReleaseHighlightBlock;
};
