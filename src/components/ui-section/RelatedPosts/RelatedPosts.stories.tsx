import type { Meta, StoryObj } from '@storybook/react-vite'
import { RelatedPosts } from './RelatedPosts'
import type { RelatedPostItem } from './RelatedPosts'

const meta: Meta<typeof RelatedPosts> = {
  title: 'ui-section/RelatedPosts',
  component: RelatedPosts,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const mockPosts: RelatedPostItem[] = [
  { slug: '/posts/interstellar',    title: 'インターステラー',           thumbnailUrl: '/images/mock-image.webp', score: 4.8 },
  { slug: '/posts/inception',       title: 'インセプション',             thumbnailUrl: '/images/mock-image.webp', score: 4.3 },
  { slug: '/posts/dark-knight',     title: 'ダークナイト',               thumbnailUrl: '/images/mock-image.webp', score: 4.5 },
  { slug: '/posts/prestige',        title: 'プレステージ',               thumbnailUrl: '/images/mock-image.webp', score: 3.8 },
  { slug: '/posts/memento',         title: 'メメント',                   thumbnailUrl: '/images/mock-image.webp', score: 3.5 },
]

export const Default: Story = {
  args: { posts: mockPosts },
}

export const WithoutScore: Story = {
  args: {
    posts: [
      { slug: '/posts/a', title: 'スコアあり作品',   thumbnailUrl: '/images/mock-image.webp', score: 4.2 },
      { slug: '/posts/b', title: 'スコアなし作品A',  thumbnailUrl: '/images/mock-image.webp' },
      { slug: '/posts/c', title: 'スコアなし作品B',  thumbnailUrl: '/images/mock-image.webp' },
    ],
  },
}

export const NoImage: Story = {
  args: {
    posts: mockPosts.map((p) => ({ ...p, thumbnailUrl: undefined })),
  },
}

export const SinglePost: Story = {
  args: {
    posts: [mockPosts[0]],
  },
}

export const OverLimit: Story = {
  args: {
    posts: [
      ...mockPosts,
      { slug: '/posts/tenet', title: 'テネット（6件目・非表示確認）', thumbnailUrl: '/images/mock-image.webp', score: 3.2 },
    ],
  },
}

export const LongTitle: Story = {
  args: {
    posts: [
      {
        slug: '/posts/long',
        title: 'ハリー・ポッターと死の秘宝 PART2 〜最終決戦と永遠の絆〜（完全版）',
        thumbnailUrl: '/images/mock-image.webp',
        score: 4.0,
      },
      ...mockPosts.slice(0, 2),
    ],
  },
}

export const Empty: Story = {
  args: { posts: [] },
}

export const English: Story = {
  args: { posts: mockPosts },
  globals: { locale: 'en' },
}
