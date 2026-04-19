import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostCard } from './PostCard';
import {
  mockPost,
  mockPostLongTitle,
  mockPostNoImage,
} from '@/mocks/post';

const meta = {
  title: 'Features/Post/PostCard',
  component: PostCard,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PostCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    post: mockPost,
  },
};

export const NoImage: Story = {
  args: {
    post: mockPostNoImage,
  },
};

export const LongTitle: Story = {
  args: {
    post: mockPostLongTitle,
  },
};
