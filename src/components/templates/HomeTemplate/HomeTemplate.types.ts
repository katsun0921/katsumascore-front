import type { Post } from '@/components/features/Post/types/post';
import type { HomeHeroProps } from '@/components/features/home/HomeHero/HomeHero';
import type { VodFinderItem } from '@/components/features/home/HomeVodFinder/HomeVodFinder';
import type { SeasonItem } from '@/components/features/home/HomeSeasonReview/HomeSeasonReview';
import type { RecommendBlock } from '@/components/features/home/HomeRecommend/HomeRecommend';
import type { FeaturedItem } from '@/components/features/home/HomeFeatured/HomeFeatured';

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
