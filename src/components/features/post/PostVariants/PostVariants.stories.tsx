import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockPost } from '@/components/features/post/mocks/post';
import { PostLeftImage } from './PostLeftImage';
import { PostTopImage } from './PostTopImage';
import { PostOverlay } from './PostOverlay';

const meta = {
  title: 'Features/Post/PostVariants',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const TopImage: Story = {
  render: () => <PostTopImage post={mockPost} />,
};

export const LeftImage: Story = {
  render: () => <PostLeftImage post={mockPost} />,
};

export const Overlay: Story = {
  render: () => <PostOverlay post={mockPost} />,
};
