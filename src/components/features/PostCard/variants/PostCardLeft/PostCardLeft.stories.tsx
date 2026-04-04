import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockPost, mockPostLongTitle, mockPostNoImage } from '@/components/features/post/mocks/post';
import { PostCardLeft } from './PostCardLeft';

const meta = {
  title: 'Features/Post/PostCardLeft',
  component: PostCardLeft,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof PostCardLeft>;

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
