import type { Meta, StoryObj } from '@storybook/react-vite';
import { HomeTemplate } from './HomeTemplate';
import { postCardListMock } from '@/components/features/post/PostCard/PostCard.mock';

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
    posts: postCardListMock,
  },
};

export const Empty: Story = {
  args: {
    posts: [],
  },
};
