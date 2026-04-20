import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockRankingPosts } from '@/components/ui-home/mocks/home';
import { HomeRanking } from './HomeRanking';

const meta: Meta<typeof HomeRanking> = {
  title: 'UI-Home/HomeRanking',
  component: HomeRanking,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0618', padding: '24px', minWidth: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    posts: mockRankingPosts,
    seeAllHref: '/ranking',
  },
};

export const NoSeeAll: Story = {
  args: {
    posts: mockRankingPosts,
  },
};

export const SingleItem: Story = {
  args: {
    posts: mockRankingPosts.slice(0, 1),
    seeAllHref: '/ranking',
  },
};

export const Dense: Story = {
  args: {
    posts: [
      ...mockRankingPosts,
      ...mockRankingPosts.map((p) => ({ ...p, id: `${p.id}-dup` })),
    ].slice(0, 10),
    seeAllHref: '/ranking',
  },
};
