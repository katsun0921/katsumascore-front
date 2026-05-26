import type { Meta, StoryObj } from '@storybook/react-vite';
import type { VodService } from '@/libs/vod';
import { HomeVodLegend } from './HomeVodLegend';

const allServices: VodService[] = [
  'netflix',
  'amazon',
  'unext',
  'hulu',
  'disney',
  'dmmtv',
  'abema',
  'appletv',
  'rakuten',
  'youtube',
];

const meta: Meta<typeof HomeVodLegend> = {
  title: 'UI-Home/HomeVodLegend',
  component: HomeVodLegend,
  args: {
    title: 'バッジの見方',
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
    services: ['netflix', 'amazon', 'unext', 'hulu', 'disney'],
  },
};

export const AllServices: Story = {
  args: {
    services: allServices,
  },
};

export const English: Story = {
  globals: { locale: 'en' },
  args: {
    title: 'Badge guide',
    services: ['netflix', 'amazon', 'unext', 'hulu', 'disney'],
  },
};
