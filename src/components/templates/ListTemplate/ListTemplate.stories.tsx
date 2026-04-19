import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListTemplate } from './ListTemplate';
import { mockPosts } from '@/mocks/post';
import { chaosPosts } from '@/mocks/chaosPosts';

const meta = {
  title: 'templates/ListTemplate',
  component: ListTemplate,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ListTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockVodRanking = [
  { id: 'vod-1', title: 'イコライザー' },
  { id: 'vod-2', title: 'M3GAN' },
  { id: 'vod-3', title: 'トロール' },
  { id: 'vod-4', title: 'ナイブズ・アウト' },
];

export const Default: Story = {
  args: {
    categoryName: '映画',
    categoryDescription: '今観るべき作品を、スコアで選ぶ',
    posts: mockPosts,
    activeFilter: 'score',
    currentPage: 1,
    totalPages: 3,
    vodRanking: mockVodRanking,
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    posts: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    posts: [],
    isLoading: false,
    totalPages: 1,
  },
};

export const LongTitle: Story = {
  args: {
    ...Default.args,
    categoryName: 'サイエンスフィクション・SF映画・アニメーション特集',
    categoryDescription: '宇宙・未来・AI・テクノロジーをテーマにした話題作を一挙にスコアで比較する',
  },
};

export const NoDescription: Story = {
  args: {
    ...Default.args,
    categoryDescription: undefined,
  },
};

export const NoVodRanking: Story = {
  args: {
    ...Default.args,
    vodRanking: undefined,
  },
};

export const Pagination: Story = {
  args: {
    ...Default.args,
    currentPage: 2,
    totalPages: 5,
  },
};

export const Chaos: Story = {
  args: {
    categoryName: '映画',
    categoryDescription: '今観るべき作品を、スコアで選ぶ',
    posts: chaosPosts,
    activeFilter: 'score',
    currentPage: 1,
    totalPages: 3,
    vodRanking: mockVodRanking,
  },
};
