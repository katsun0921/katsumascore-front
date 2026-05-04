import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockFacebookTimelineEmbedUrl } from '@/components/ui-home/mocks/home';
import { HomeFacebook } from './HomeFacebook';

const meta: Meta<typeof HomeFacebook> = {
  title: 'UI-Home/HomeFacebook',
  component: HomeFacebook,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div
        style={{
          background: '#0a0618',
          padding: '24px',
          maxWidth: '320px',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Facebook',
    embedUrl: mockFacebookTimelineEmbedUrl,
  },
};
