import type { Meta, StoryObj } from '@storybook/react-vite';
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
import { HomeTemplate } from './HomeTemplate';

const meta: Meta<typeof HomeTemplate> = {
  title: 'Templates/HomeTemplate',
  component: HomeTemplate,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  hero: mockHeroData,
  rankingPosts: mockRankingPosts,
  latestPosts: mockLatestPosts,
  animeArchiveHref: '/anime',
  animePosts: mockAnimePosts,
  highScorePosts: mockHighScorePosts,
  recommendBlocks: mockRecommendBlocks,
  vodFinderItems: mockVodFinderItems,
  seasonItems: mockSeasonItems,
  featuredItems: mockFeaturedItems,
};

export const Default: Story = {
  args: defaultArgs,
};

export const MinimalData: Story = {
  args: {
    ...defaultArgs,
    rankingPosts: mockRankingPosts.slice(0, 3),
    latestPosts: mockLatestPosts.slice(0, 2),
    animePosts: mockAnimePosts.slice(0, 2),
    recommendBlocks: mockRecommendBlocks.slice(0, 1),
    vodFinderItems: mockVodFinderItems.slice(0, 2),
    seasonItems: mockSeasonItems.slice(0, 1),
    featuredItems: mockFeaturedItems.slice(0, 1),
  },
};

export const NoImages: Story = {
  args: {
    ...defaultArgs,
    rankingPosts: mockRankingPosts.map((p) => ({ ...p, image: null })),
    latestPosts: mockLatestPosts.map((p) => ({ ...p, image: null })),
    animePosts: mockAnimePosts.map((p) => ({ ...p, image: null })),
    highScorePosts: mockHighScorePosts.map((p) => ({ ...p, image: null })),
  },
};
