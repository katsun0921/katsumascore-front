import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockPost, mockPostLongTitle, mockPostNoImage } from '@/components/features/post/mocks/post';
import { PostOverlay } from './PostOverlay';

const meta = {
  title: 'Features/Post/PostOverlay',
  component: PostOverlay,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof PostOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { post: mockPost },
};

export const LongTitle: Story = {
  args: { post: mockPostLongTitle },
};

export const NoImage: Story = {
  args: { post: mockPostNoImage },
};
