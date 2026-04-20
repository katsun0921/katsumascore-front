import Head from 'next/head';
import { HomeTemplate } from '@/components/templates/HomeTemplate';
import {
  mockHeroData,
  mockRankingPosts,
  mockLatestPosts,
  mockAnimePosts,
  mockHighScorePosts,
  mockRecommendBlocks,
  mockVodFinderItems,
  mockSeasonItems,
  mockFeaturedItems,
} from '@/components/ui-home/mocks/home';

const Home = () => {
  return (
    <>
      <Head>
        <title>KatsumaScore</title>
      </Head>
      <HomeTemplate
        hero={mockHeroData}
        rankingPosts={mockRankingPosts}
        latestPosts={mockLatestPosts}
        animePosts={mockAnimePosts}
        highScorePosts={mockHighScorePosts}
        recommendBlocks={mockRecommendBlocks}
        vodFinderItems={mockVodFinderItems}
        seasonItems={mockSeasonItems}
        featuredItems={mockFeaturedItems}
      />
    </>
  );
};

export default Home;
