import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockPost, mockPostLongTitle, mockPostNoImage } from '@/mocks/post';
import { PostCardImgTop } from './PostCardImgTop';

const meta = {
  title: 'ui-section/PostCardImgTop',
  component: PostCardImgTop,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof PostCardImgTop>;

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

export const WithCaption: Story = {
  args: { post: mockPost, caption: '役: サンプルキャラクター' },
};
