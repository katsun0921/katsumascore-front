import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockSeasonItems } from '@/components/features/home/mocks/home';
import { HomeSeasonReview } from './HomeSeasonReview';

const meta: Meta<typeof HomeSeasonReview> = {
  title: 'Features/Home/HomeSeasonReview',
  component: HomeSeasonReview,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0618', padding: '24px', maxWidth: '500px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    seasons: mockSeasonItems,
  },
};

export const SingleSeason: Story = {
  args: {
    seasons: mockSeasonItems.slice(0, 1),
  },
};

export const ManySeasons: Story = {
  args: {
    seasons: [
      ...mockSeasonItems,
      { label: '冬', period: '2025年 1-3月', href: '/season/2025-winter' },
      { label: '秋', period: '2024年 10-12月', href: '/season/2024-autumn' },
      { label: '夏', period: '2024年 7-9月', href: '/season/2024-summer' },
    ],
  },
};
