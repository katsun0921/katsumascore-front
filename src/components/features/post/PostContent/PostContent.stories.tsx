import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockPostContent } from '@/components/features/post/mocks/post';
import { PostContent } from './PostContent';

const meta: Meta<typeof PostContent> = {
  title: 'Features/Post/PostContent',
  component: PostContent,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: mockPostContent.content,
  },
};
