import type { Meta, StoryObj } from '@storybook/react-vite';
import { RelationPost } from './RelationPost';
import type { RelationPostItem } from './RelationPost.types';

const meta: Meta<typeof RelationPost> = {
  title: 'ui-section/RelationPost',
  component: RelationPost,
  parameters: { layout: 'padded' },
  args: {
    heading: '関連作品',
  },
};
export default meta;

type Story = StoryObj<typeof meta>

const mockPosts: RelationPostItem[] = [
  { id: 1, title: 'インターステラー', href: '/posts/interstellar', imageUrl: '/images/mock-image.webp' },
  { id: 2, title: 'インセプション', href: '/posts/inception', imageUrl: '/images/mock-image.webp' },
  { id: 3, title: 'ダークナイト', href: '/posts/dark-knight', imageUrl: '/images/mock-image.webp' },
  { id: 4, title: 'プレステージ', href: '/posts/prestige', imageUrl: '/images/mock-image.webp' },
];

export const Default: Story = {
  args: { posts: mockPosts },
};

export const ThreeColumn: Story = {
  args: { posts: mockPosts, kind: 'imgLeft' },
};

export const NoImage: Story = {
  args: {
    posts: mockPosts.map((p) => ({ ...p, imageUrl: undefined })),
  },
};

export const LongTitle: Story = {
  args: {
    posts: [
      { id: 1, title: 'ハリー・ポッターと死の秘宝 PART2 〜最終決戦と永遠の絆〜（完全版）', href: '/posts/hp', imageUrl: '/images/mock-image.webp' },
      { id: 2, title: 'インターステラー', href: '/posts/interstellar', imageUrl: '/images/mock-image.webp' },
    ],
  },
};

export const SinglePost: Story = {
  args: { posts: [mockPosts[0]] },
};

export const ManyPosts: Story = {
  args: {
    posts: [
      ...mockPosts,
      { id: 5, title: 'メメント', href: '/posts/memento', imageUrl: '/images/mock-image.webp' },
      { id: 6, title: 'テネット', href: '/posts/tenet', imageUrl: '/images/mock-image.webp' },
    ],
  },
};
