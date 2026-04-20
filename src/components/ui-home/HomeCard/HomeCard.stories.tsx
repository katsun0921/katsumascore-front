import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Post } from '@/types/post';
import { HomeCard } from './HomeCard';

const basePost: Post = {
  id: '1',
  slug: '/posts/sample',
  title: 'KPOPガールズ! デーモン・ハンターズ',
  excerpt: '',
  image: null,
  publishedAt: '2025-01-10',
  category: 'アニメ',
  score: 4.2,
  vods: ['netflix', 'amazon'],
};

const meta: Meta<typeof HomeCard> = {
  title: 'UI-Home/HomeCard',
  component: HomeCard,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0618', padding: '24px', width: 'fit-content' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { post: basePost },
};

export const NoImage: Story = {
  args: { post: { ...basePost, image: null } },
};

export const NoScore: Story = {
  args: { post: { ...basePost, score: undefined } },
};

export const NoVods: Story = {
  args: { post: { ...basePost, vods: undefined } },
};

export const LowScore: Story = {
  args: { post: { ...basePost, score: 2.1 } },
};

export const LongTitle: Story = {
  args: {
    post: {
      ...basePost,
      title: 'とても長いタイトルのサンプル作品：シーズン3 完結編 スペシャル・エディション',
    },
  },
};

export const MinimalPost: Story = {
  args: {
    post: {
      id: '99',
      slug: '/posts/minimal',
      title: '最小構成のカード',
      excerpt: '',
      image: null,
      publishedAt: '2025-04-01',
    },
  },
};
