import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockPosts } from '@/components/features/post/mocks/post';
import { HomeTemplate } from './HomeTemplate';

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
    posts: mockPosts,
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
