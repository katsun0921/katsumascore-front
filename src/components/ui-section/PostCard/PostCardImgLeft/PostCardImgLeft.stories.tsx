import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockPost, mockPostLongTitle, mockPostNoImage } from '@/mocks/post';
import { PostCardImgLeft } from './PostCardImgLeft';

const meta = {
  title: 'ui-section/PostCardImgLeft',
  component: PostCardImgLeft,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof PostCardImgLeft>;

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
