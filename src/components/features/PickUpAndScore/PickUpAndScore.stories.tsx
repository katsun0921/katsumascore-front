import type { Meta, StoryObj } from '@storybook/react-vite'
import { PickUpAndScore } from './PickUpAndScore'
import type { PickUpPost } from './PickUpAndScore'

const meta: Meta<typeof PickUpAndScore> = {
  title: 'Layout/Sidebar/PickUpAndScore',
  component: PickUpAndScore,
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

const mockPickup: PickUpPost[] = [
  { slug: '/posts/interstellar', title: 'インターステラー',     thumbnailUrl: '/images/mock-image.webp', score: 4.8 },
  { slug: '/posts/inception',    title: 'インセプション',       thumbnailUrl: '/images/mock-image.webp', score: 4.3 },
  { slug: '/posts/dark-knight',  title: 'ダークナイト',         thumbnailUrl: '/images/mock-image.webp', score: 4.5 },
  { slug: '/posts/parasite',     title: 'パラサイト 半地下の家族', thumbnailUrl: '/images/mock-image.webp', score: 4.2 },
  { slug: '/posts/arrival',      title: 'メッセージ',           thumbnailUrl: '/images/mock-image.webp', score: 4.0 },
]

const mockHighScore: PickUpPost[] = [
  { slug: '/posts/shawshank',   title: 'ショーシャンクの空に', thumbnailUrl: '/images/mock-image.webp', score: 4.9 },
  { slug: '/posts/godfather',   title: 'ゴッドファーザー',     thumbnailUrl: '/images/mock-image.webp', score: 4.7 },
  { slug: '/posts/schindler',   title: 'シンドラーのリスト',   thumbnailUrl: '/images/mock-image.webp', score: 4.6 },
  { slug: '/posts/spirited',    title: '千と千尋の神隠し',     thumbnailUrl: '/images/mock-image.webp', score: 4.5 },
  { slug: '/posts/your-name',   title: '君の名は。',           thumbnailUrl: '/images/mock-image.webp', score: 4.4 },
]

// ── PICK UP タブ選択状態（デフォルト）
export const PickUpActive: Story = {
  args: {
    pickupPosts: mockPickup,
    highScorePosts: mockHighScore,
  },
}

// ── HIGH SCORE タブ選択状態（PICK UPが空 → HIGH SCOREがデフォルト）
export const HighScoreActive: Story = {
  args: {
    pickupPosts: [],
    highScorePosts: mockHighScore,
  },
}

// ── PICK UP 未設定 → タブが HIGH SCORE のみ表示
export const PickUpEmpty: Story = {
  args: {
    pickupPosts: [],
    highScorePosts: mockHighScore,
  },
}

// ── 全記事スコア付き
export const AllWithScore: Story = {
  args: {
    pickupPosts: mockPickup,
    highScorePosts: mockHighScore,
  },
}

// ── スコアありなし混在
export const MixedScore: Story = {
  args: {
    pickupPosts: [
      { slug: '/posts/a', title: 'スコアあり作品',  thumbnailUrl: '/images/mock-image.webp', score: 4.5 },
      { slug: '/posts/b', title: 'スコアなし作品A', thumbnailUrl: '/images/mock-image.webp' },
      { slug: '/posts/c', title: 'スコアなし作品B', thumbnailUrl: '/images/mock-image.webp' },
    ],
    highScorePosts: mockHighScore,
  },
}

// ── サムネイルなし
export const NoImage: Story = {
  args: {
    pickupPosts: mockPickup.map((p) => ({ ...p, thumbnailUrl: undefined })),
    highScorePosts: mockHighScore.map((p) => ({ ...p, thumbnailUrl: undefined })),
  },
}

// ── タイトルが長い（2行クランプ確認）
export const LongTitle: Story = {
  args: {
    pickupPosts: [
      {
        slug: '/posts/long',
        title: 'ハリー・ポッターと死の秘宝 PART2 〜最終決戦と永遠の絆〜（完全版）',
        thumbnailUrl: '/images/mock-image.webp',
        score: 4.0,
      },
      ...mockPickup.slice(0, 2),
    ],
    highScorePosts: mockHighScore,
  },
}

// ── 両方空（非表示確認）
export const BothEmpty: Story = {
  args: {
    pickupPosts: [],
    highScorePosts: [],
  },
}
