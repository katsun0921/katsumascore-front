import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostList } from './PostList';
import {
  postListEmptyMock,
  postListLoadingMock,
  postListMock,
} from './PostList.mock';

const meta = {
  title: 'Features/Post/PostList',
  component: PostList,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PostList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    posts: postListMock,
    variant: 'grid',
  },
};

export const Empty: Story = {
  args: {
    posts: postListEmptyMock,
  },
};

export const Loading: Story = {
  args: {
    posts: postListLoadingMock,
    isLoading: true,
    variant: 'grid',
  },
};

export const Grid: Story = {
  args: {
    posts: postListMock,
    variant: 'grid',
  },
};

export const List: Story = {
  args: {
    posts: postListMock,
    variant: 'list',
  },
};
