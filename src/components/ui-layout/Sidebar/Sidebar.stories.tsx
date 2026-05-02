import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sidebar } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>

const mockRelationPosts = [
  { id: 1, title: '関連作品A', href: '/posts/related-a', imageUrl: '/images/mock-image.webp' },
  { id: 2, title: '関連作品B', href: '/posts/related-b', imageUrl: '/images/mock-image.webp' },
  { id: 3, title: '関連作品C', href: '/posts/related-c' },
];

const mockStreamingVods = [
  { service: 'netflix' as const, url: 'https://netflix.com', isPaid: true },
  { service: 'amazon' as const, url: 'https://amazon.co.jp/prime-video' },
];

const mockPostsGroups = [
  {
    heading: 'こちらもおすすめです！',
    posts: [
      { id: '1', title: 'おすすめ作品1', href: '/posts/1', image: '/images/mock-image.webp', slug: 'post-1', excerpt: '', publishedAt: '2026-04-01' },
      { id: '2', title: 'おすすめ作品2', href: '/posts/2', image: '/images/mock-image.webp', slug: 'post-2', excerpt: '', publishedAt: '2026-04-01' },
    ],
  },
];

const mockProfile = {
  comment: '最近はSF映画にハマってます！インターステラーは何度見ても泣けます。',
};

// ── ❶ Profile + ❻ 関連記事 + ❷ VOD + ❹ レンタル + ❼ PostsGroup 全部入り
export const Default: Story = {
  args: {
    profile: mockProfile,
    titleJp: 'インターステラー',
    titleEn: 'Interstellar',
    isCinemaShowing: false,
    relationPosts: mockRelationPosts,
    streamingVods: mockStreamingVods,
    postsGroups: mockPostsGroups,
  },
};

// ── 劇場公開中（VOD・レンタル非表示）
export const CinemaShowing: Story = {
  args: {
    ...Default.args,
    isCinemaShowing: true,
  },
};

// ── 英語ロケール（レンタル非表示）
export const EnLocale: Story = {
  args: {
    ...Default.args,
  },
  globals: { locale: 'en' },
};

// ── 関連記事のみ（VODなし。レンタルは固定枠のため表示）
export const RelatedOnly: Story = {
  args: {
    relationPosts: mockRelationPosts,
  },
};

// ── VODのみ
export const VodOnly: Story = {
  args: {
    titleJp: 'インターステラー',
    titleEn: 'Interstellar',
    streamingVods: mockStreamingVods,
  },
};

// ── 何も表示しない（空）
export const Empty: Story = {};
