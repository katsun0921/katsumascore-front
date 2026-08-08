import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  mockHeroData,
  mockRankingPosts,
  mockLatestPosts,
  mockAnimePosts,
  mockHighScorePosts,
  mockShortVideoPosts,
  mockRecommendBlocks,
  mockVodFinderItems,
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
  shortVideoPosts: mockShortVideoPosts,
  recommendBlocks: mockRecommendBlocks,
  vodFinderItems: mockVodFinderItems,
  featuredItems: mockFeaturedItems,
  theaterReleaseHighlight: {
    title: '今週公開の映画まとめ（2026年8月第1週）',
    publishedAt: '2026-08-08',
    href: '/theater-release/theater-release-2026-08-02',
  },
  vodReleaseHighlight: {
    title: '今週配信開始のVOD作品まとめ（2026年8月第1週）',
    publishedAt: '2026-08-08',
    href: '/vod-release/vod-release-2026-08-02',
  },
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

export const NoReleaseHighlight: Story = {
  args: {
    ...defaultArgs,
    theaterReleaseHighlight: undefined,
    vodReleaseHighlight: undefined,
  },
};
