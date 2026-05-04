import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockRecommendBlocks } from '@/components/ui-home/mocks/home';
import { HomeRecommend } from './HomeRecommend';

const meta: Meta<typeof HomeRecommend> = {
  title: 'UI-Home/HomeRecommend',
  component: HomeRecommend,
  args: {
    title: 'こちらもおすすめ',
    seeAllLabel: 'すべて見る →',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0618', padding: '24px', maxWidth: '700px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    blocks: mockRecommendBlocks,
  },
};

export const SingleBlock: Story = {
  args: {
    blocks: mockRecommendBlocks.slice(0, 1),
  },
};

export const LongTagName: Story = {
  args: {
    blocks: [
      {
        ...mockRecommendBlocks[0],
        tag: 'サイエンスフィクション・スペースオペラ',
      },
    ],
  },
};
