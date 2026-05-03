import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockFeaturedItems } from '@/components/ui-home/mocks/home';
import { HomeFeatured } from './HomeFeatured';

const meta: Meta<typeof HomeFeatured> = {
  title: 'UI-Home/HomeFeatured',
  component: HomeFeatured,
  args: {
    title: '特集',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0618', padding: '24px', maxWidth: '800px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: mockFeaturedItems,
  },
};

export const SingleItem: Story = {
  args: {
    items: mockFeaturedItems.slice(0, 1),
  },
};

export const LongTitle: Story = {
  args: {
    items: mockFeaturedItems.map((item) => ({
      ...item,
      title: '非常に長いタイトルの特集記事：サブタイトルが続いてさらに長くなるケースを検証するためのテスト',
    })),
  },
};

export const ManyItems: Story = {
  args: {
    items: [
      ...mockFeaturedItems,
      { label: 'SPECIAL', title: '映画ランキング年間総決算', description: '2025年ベスト映画10選', href: '/special/2025-best', isPrimary: false },
      { label: 'COLUMN', title: 'ホラー映画入門ガイド', description: '初心者が観るべき10本', href: '/special/horror-guide', isPrimary: false },
    ],
  },
};
