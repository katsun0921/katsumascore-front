import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostList } from './PostList';
import { mockPosts } from '@/mocks/post';

const meta = {
  title: 'UI-Section/PostList',
  component: PostList,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PostList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    posts: mockPosts,
    variant: 'grid',
  },
};

export const Empty: Story = {
  args: {
    posts: [],
  },
};

export const Loading: Story = {
  args: {
    posts: [],
    isLoading: true,
  },
};
