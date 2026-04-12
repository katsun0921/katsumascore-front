import type { Meta, StoryObj } from '@storybook/react-vite'
import { extractToc } from '@/lib/toc'
import { mockPostContentFull } from '@/components/features/Post/mocks/post'
import { Sidebar } from './Sidebar'

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

const mockRelationPosts = [
  { id: 1, title: '関連作品A', href: '/posts/related-a', imageUrl: '/images/mock-image.webp' },
  { id: 2, title: '関連作品B', href: '/posts/related-b', imageUrl: '/images/mock-image.webp' },
  { id: 3, title: '関連作品C', href: '/posts/related-c' },
]

const mockStreamingVods = [
  { service: 'netflix' as const, url: 'https://netflix.com', isPaid: true },
  { service: 'amazon' as const, url: 'https://amazon.co.jp/prime-video' },
]

const mockRentalServices = [
  { service: 'tsutaya' as const, url: 'https://tsutaya.com' },
]

const mockPostsGroups = [
  {
    heading: 'こちらもおすすめです！',
    posts: [
      { id: 1, title: 'おすすめ作品1', href: '/posts/1', image: '/images/mock-image.webp', slug: 'post-1', excerpt: '' },
      { id: 2, title: 'おすすめ作品2', href: '/posts/2', image: '/images/mock-image.webp', slug: 'post-2', excerpt: '' },
    ],
  },
]

const mockToc = extractToc(mockPostContentFull.content)

const mockProfile = {
  name: 'Katsuma',
  description: '映画好きのKatsumaが独自スコアでレビューするブログ。年間200本以上鑑賞。',
  comment: '最近はSF映画にハマってます！インターステラーは何度見ても泣けます。',
  avatarUrl: '/images/mock-avatar.webp',
  aboutUrl: '/about',
  social: {
    x: 'https://x.com/Katsun0921',
    instagram: 'https://instagram.com/katsumascore',
  },
}

// ── ❶ Profile + ❻ 関連記事 + ❷ VOD + ❹ レンタル + ❼ PostsGroup 全部入り
export const Default: Story = {
  args: {
    locale: 'ja',
    profile: mockProfile,
    toc: mockToc,
    titleJp: 'インターステラー',
    titleEn: 'Interstellar',
    isCinemaShowing: false,
    relationPosts: mockRelationPosts,
    streamingVods: mockStreamingVods,
    rentalServices: mockRentalServices,
    postsGroups: mockPostsGroups,
  },
}

// ── 劇場公開中（VOD・レンタル非表示）
export const CinemaShowing: Story = {
  args: {
    ...Default.args,
    isCinemaShowing: true,
  },
}

// ── 英語ロケール（レンタル非表示）
export const EnLocale: Story = {
  args: {
    ...Default.args,
    locale: 'en',
  },
}

// ── 関連記事のみ（VOD・レンタルなし）
export const RelatedOnly: Story = {
  args: {
    locale: 'ja',
    relationPosts: mockRelationPosts,
  },
}

// ── VODのみ
export const VodOnly: Story = {
  args: {
    locale: 'ja',
    titleJp: 'インターステラー',
    titleEn: 'Interstellar',
    streamingVods: mockStreamingVods,
  },
}

// ── 何も表示しない（空）
export const Empty: Story = {
  args: {
    locale: 'ja',
  },
}
