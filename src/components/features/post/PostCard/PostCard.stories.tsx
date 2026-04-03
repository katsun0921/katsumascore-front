import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostCard } from './PostCard';
import {
  postCardCompactMock,
  postCardDefaultMock,
  postCardLoadingMock,
  postCardLongTitleMock,
  postCardNoImageMock,
} from './PostCard.mock';

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
    post: postCardDefaultMock,
  },
};

export const NoImage: Story = {
  args: {
    post: postCardNoImageMock,
  },
};

export const LongTitle: Story = {
  args: {
    post: postCardLongTitleMock,
  },
};

export const Loading: Story = {
  args: {
    post: postCardLoadingMock,
    isLoading: true,
  },
};

export const Compact: Story = {
  args: {
    post: postCardCompactMock,
    variant: 'compact',
  },
};
