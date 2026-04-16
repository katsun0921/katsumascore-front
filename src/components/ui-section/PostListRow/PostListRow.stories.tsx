import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostListRow } from './PostListRow';
import { mockPosts } from '@/components/features/Post/mocks/post';

const meta: Meta<typeof PostListRow> = {
  title: 'UI-Section/PostListRow',
  component: PostListRow,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof PostListRow>;

export const Default: Story = {
  args: { posts: mockPosts.slice(0, 4) },
};

export const Single: Story = {
  args: { posts: mockPosts.slice(0, 1) },
};

export const Loading: Story = {
  args: { posts: [], isLoading: true },
};

export const Empty: Story = {
  args: { posts: [] },
};

export const Dense: Story = {
  args: { posts: mockPosts.slice(0, 10) },
};
