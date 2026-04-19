import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostCardMedia } from './PostCardMedia';

const meta = {
  title: 'Ui-Parts/PostCardMedia',
  component: PostCardMedia,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PostCardMedia>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    image: '/images/mock-image.webp',
    title: 'サンプル記事タイトル',
  },
};

export const NoImage: Story = {
  args: {
    image: null,
    title: 'サンプル記事タイトル',
  },
};

export const LongTitle: Story = {
  args: {
    image: '/images/mock-image.webp',
    title: '非常に長いタイトルのサンプル記事：alt テキストの切れが生じないことを確認するためのケース',
  },
};

export const LongTitleNoImage: Story = {
  args: {
    image: null,
    title: '非常に長いタイトルのサンプル記事：alt テキストの切れが生じないことを確認するためのケース',
  },
};
