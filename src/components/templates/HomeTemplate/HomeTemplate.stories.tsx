import type { Meta, StoryObj } from '@storybook/react-vite';
import { HomeTemplate } from './HomeTemplate';
import { postListEmptyMock, postListMock } from '@/components/features/post/PostList/PostList.mock';

const meta: Meta<typeof HomeTemplate> = {
  title: 'Templates/HomeTemplate',
  component: HomeTemplate,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    posts: postListMock,
  },
};

export const Empty: Story = {
  args: {
    posts: postListEmptyMock,
  },
};

export const Loading: Story = {
  args: {
    posts: postListEmptyMock,
    isLoading: true,
  },
};
