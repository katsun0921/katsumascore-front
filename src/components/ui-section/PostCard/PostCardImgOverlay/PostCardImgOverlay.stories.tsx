import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockPost, mockPostLongTitle, mockPostNoImage } from '@/mocks/post';
import { PostCardImgOverlay } from './PostCardImgOverlay';

const meta = {
  title: 'ui-section/PostCardImgOverlay',
  component: PostCardImgOverlay,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof PostCardImgOverlay>;

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
