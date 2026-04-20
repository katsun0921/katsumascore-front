import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  mockLatestPosts,
  mockAnimePosts,
  mockHighScorePosts,
} from '@/components/features/home/mocks/home';
import { HomeCardScrollList } from './HomeCardScrollList';

const meta: Meta<typeof HomeCardScrollList> = {
  title: 'UiHome/HomeCardScrollList',
  component: HomeCardScrollList,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0618', padding: '24px', maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LatestReviews: Story = {
  args: {
    title: '最新レビュー',
    posts: mockLatestPosts,
    seeAllHref: '/posts',
  },
};

export const AnimeSection: Story = {
  args: {
    title: '注目のアニメ',
    posts: mockAnimePosts,
    seeAllHref: '/anime',
  },
};

export const HighScore: Story = {
  args: {
    title: '高評価作品',
    posts: mockHighScorePosts,
    icon: 'star',
  },
};

export const NoTitle: Story = {
  args: {
    posts: mockLatestPosts,
  },
};

export const NoImage: Story = {
  args: {
    title: '画像なしテスト',
    posts: mockLatestPosts.map((p) => ({ ...p, image: null })),
  },
};

export const Dense: Story = {
  args: {
    title: 'Dense（10+）',
    posts: [
      ...mockLatestPosts,
      ...mockLatestPosts.map((p) => ({ ...p, id: `${p.id}-2` })),
      ...mockHighScorePosts.map((p) => ({ ...p, id: `${p.id}-3` })),
    ],
    seeAllHref: '/posts',
  },
};

export const Extreme: Story = {
  args: {
    title: 'Extreme（20+）',
    posts: Array.from({ length: 22 }, (_, i) => ({
      ...mockLatestPosts[i % mockLatestPosts.length],
      id: `extreme-${i}`,
    })),
    seeAllHref: '/posts',
  },
};
