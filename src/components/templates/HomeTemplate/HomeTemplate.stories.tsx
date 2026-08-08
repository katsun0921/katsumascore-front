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
    href: '/theater-release/theater-release-2026-08-02',
    articleTitle: '今週公開の映画まとめ（2026年8月第1週）',
    works: [
      { title: 'ゴースト・オブ・ウエノ', meta: '8月8日(土)公開', href: 'https://example.com/', isExternal: true },
      { title: '真夏の方程式 リブート', meta: '8月8日(土)公開', href: '/ja/movie/midsummer-formula', isExternal: false },
    ],
  },
  vodReleaseHighlight: {
    href: '/vod-release/vod-release-2026-08-02',
    articleTitle: '今週配信開始のVOD作品まとめ（2026年8月第1週）',
    works: [
      { title: 'スター・ウォーズ：ビジョンズ／九人目のジェダイ', meta: 'Disney+', href: 'https://www.disneyplus.com/', isExternal: true },
      { title: 'ストレンジャー・シングス シーズン5', meta: 'Netflix', href: '/ja/drama/stranger-things-5', isExternal: false },
    ],
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
