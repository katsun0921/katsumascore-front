import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockVodFinderItems } from '@/components/ui-home/mocks/home';
import { HomeVodFinder } from './HomeVodFinder';

const meta: Meta<typeof HomeVodFinder> = {
  title: 'UI-Home/HomeVodFinder',
  component: HomeVodFinder,
  args: {
    title: 'VODで探す',
    workCountSuffix: '作品',
  },
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
      { vod: 'disney' as const, label: 'Disney+', count: 3, href: '/vod/disney' },
      { vod: 'abema' as const, label: 'ABEMA', count: 2, href: '/vod/abema' },
      { vod: 'dmmtv' as const, label: 'DMM TV', count: 1, href: '/vod/dmmtv' },
      { vod: 'appletv' as const, label: 'Apple TV+', count: 5, href: '/vod/appletv' },
    ],
  },
};
