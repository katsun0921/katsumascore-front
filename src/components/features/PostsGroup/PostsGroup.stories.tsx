import type { Meta, StoryObj } from '@storybook/react-vite'
import { PostsGroup } from './PostsGroup'
import { mockPosts, mockPostNoImage } from '@/components/features/post/mocks/post'

const meta = {
  title: 'Features/PostsGroup',
  component: PostsGroup,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PostsGroup>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// SingleGroup — シリーズ・カテゴリ・タグ単一グループ
// ---------------------------------------------------------------------------
export const SingleGroup: Story = {
  args: {
    groups: [
      {
        heading: 'シリーズは他にもあります！',
        posts: mockPosts.slice(0, 3),
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// WithDescription — 説明文付き
// ---------------------------------------------------------------------------
export const WithDescription: Story = {
  args: {
    groups: [
      {
        heading: 'こちらもおすすめです！',
        description: 'Netflixで見られる作品をまとめています。',
        posts: mockPosts.slice(0, 3),
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// MultipleGroups — 複数グループ（RelationPost / 関連ACFグループ相当）
// ---------------------------------------------------------------------------
export const MultipleGroups: Story = {
  args: {
    groups: [
      {
        heading: '関連ページ',
        posts: mockPosts.slice(0, 3),
      },
      {
        heading: 'Netflixもおすすめです！',
        description: '同じNetflixで配信している作品です。',
        posts: mockPosts.slice(0, 2),
      },
      {
        heading: 'アニメもおすすめです！',
        posts: mockPosts.slice(0, 3),
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// NoImage — 画像なし投稿を含む
// ---------------------------------------------------------------------------
export const NoImage: Story = {
  args: {
    groups: [
      {
        heading: 'こちらもおすすめです！',
        posts: [mockPostNoImage, mockPostNoImage, mockPostNoImage],
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// Empty — 全グループが空の場合は何も表示しない
// ---------------------------------------------------------------------------
export const Empty: Story = {
  args: {
    groups: [
      { heading: 'グループA', posts: [] },
      { heading: 'グループB', posts: [] },
    ],
  },
}

// ---------------------------------------------------------------------------
// TwoColumn — 投稿が2件の場合（3カラムが崩れないことを確認）
// ---------------------------------------------------------------------------
export const TwoColumn: Story = {
  args: {
    groups: [
      {
        heading: '関連ページ',
        posts: mockPosts.slice(0, 2),
      },
    ],
  },
}
