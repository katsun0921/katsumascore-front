import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostCardBody } from './PostCardBody';

const meta = {
  title: 'Ui-Parts/PostCardBody',
  component: PostCardBody,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PostCardBody>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    publishedAt: '2026-04-01',
    title: 'サンプル記事タイトル',
    excerpt: '記事の概要テキストがここに入ります。',
  },
};

export const LongTitle: Story = {
  args: {
    publishedAt: '2026-04-01',
    title: '非常に長いタイトルのサンプル：3行を超えた場合にクランプされることを確認するための長大なタイトルテキスト',
    excerpt: '記事の概要テキストがここに入ります。',
  },
};

export const LongExcerpt: Story = {
  args: {
    publishedAt: '2026-04-01',
    title: 'サンプル記事タイトル',
    excerpt:
      '非常に長い概要テキストがここに入ります。200文字を超えるような文章でも3行クランプが正しく機能することを確認します。実際の運用で記事概要が長くなることは十分に考えられるため、このケースでレイアウト崩れがないことを確認します。',
  },
};

export const EmptyStrings: Story = {
  args: {
    publishedAt: '2026-04-01',
    title: '',
    excerpt: '',
  },
};
