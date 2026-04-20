import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockVodFinderItems } from '@/components/ui-home/mocks/home';
import { HomeVodFinder } from './HomeVodFinder';

const meta: Meta<typeof HomeVodFinder> = {
  title: 'UIHome/HomeVodFinder',
  component: HomeVodFinder,
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

export const Default: Story = {
  args: {
    items: mockVodFinderItems,
  },
};

export const NoCount: Story = {
  args: {
    items: mockVodFinderItems.map(({ count: _count, ...rest }) => rest),
  },
};

export const AllServices: Story = {
  args: {
    items: [
      ...mockVodFinderItems,
      { vod: 'disney' as const, count: 3, href: '/vod/disney' },
      { vod: 'abema' as const, count: 2, href: '/vod/abema' },
      { vod: 'dmmtv' as const, count: 1, href: '/vod/dmmtv' },
      { vod: 'appletv' as const, count: 5, href: '/vod/appletv' },
    ],
  },
};
