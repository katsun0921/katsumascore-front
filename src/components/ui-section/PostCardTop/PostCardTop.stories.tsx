import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockPost, mockPostLongTitle, mockPostNoImage } from '@/mocks/post';
import { PostCardTop } from './PostCardTop';

const meta = {
  title: 'Ui-Section/PostCardTop',
  component: PostCardTop,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof PostCardTop>;

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
