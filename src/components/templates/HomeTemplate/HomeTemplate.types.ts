import type { Post } from '@/types/post';
import type { HomeHeroProps } from '@/components/features/home/HomeHero';
import type { VodFinderItem } from '@/components/features/home/HomeVodFinder';
import type { SeasonItem } from '@/components/features/home/HomeSeasonReview';
import type { RecommendBlock } from '@/components/features/home/HomeRecommend';
import type { FeaturedItem } from '@/components/features/home/HomeFeatured';

export type HomeTemplateProps = {
  hero: HomeHeroProps;
  rankingPosts: Post[];
  latestPosts: Post[];
  animePosts: Post[];
  highScorePosts: Post[];
  recommendBlocks: RecommendBlock[];
  vodFinderItems: VodFinderItem[];
  seasonItems: SeasonItem[];
  featuredItems: FeaturedItem[];
};
