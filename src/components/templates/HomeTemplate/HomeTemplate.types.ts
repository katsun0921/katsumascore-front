import type { Post } from '@/types/post';
import type { HomeHeroProps } from '@/components/features/HomeHero';
import type { VodFinderItem } from '@/components/ui-home/HomeVodFinder';
import type { RecommendBlock } from '@/components/ui-home/HomeRecommend';
import type { FeaturedItem } from '@/components/ui-home/HomeFeatured';

export type HomeTemplateProps = {
  hero: HomeHeroProps;
  rankingPosts: Post[];
  latestPosts: Post[];
  animeArchiveHref: string;
  animePosts: Post[];
  highScorePosts: Post[];
  recommendBlocks: RecommendBlock[];
  vodFinderItems: VodFinderItem[];
  featuredItems: FeaturedItem[];
  /** Facebook Page Plugin の iframe `src`（未設定時は Katsumascore 公式ページの既定プラグイン URL） */
  facebookTimelineEmbedUrl: string;
};
