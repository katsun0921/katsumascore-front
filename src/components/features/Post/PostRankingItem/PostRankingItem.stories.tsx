import type { Meta, StoryObj } from '@storybook/react-vite'
import { PostRankingItem } from './PostRankingItem'

const meta: Meta<typeof PostRankingItem> = {
  title: 'features/Post/PostRankingItem',
  component: PostRankingItem,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <ul><Story /></ul>],
  args: {
    post: {
      id: '1',
      slug: '/posts/interstellar',
      title: 'インターステラー',
      excerpt: '時間と愛をテーマにした、クリストファー・ノーランの壮大なSF叙事詩。',
      image: '/images/mock-image.webp',
      publishedAt: '2024-01-01',
      score: 4.8,
    },
    rank: 1,
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Rank1: Story = {}

export const Rank2: Story = {
  args: { rank: 2 },
}

export const Rank3: Story = {
  args: { rank: 3 },
}

export const Rank4: Story = {
  args: { rank: 4 },
}

export const NoImage: Story = {
  args: {
    post: {
      id: '2',
      slug: '/posts/no-image',
      title: 'サムネイルなし作品',
      excerpt: '画像なしのフォールバック確認。',
      image: null,
      publishedAt: '2024-01-01',
      score: 3.2,
    },
    rank: 5,
  },
}

export const NoScore: Story = {
  args: {
    post: {
      id: '3',
      slug: '/posts/no-score',
      title: 'スコアなし作品',
      excerpt: 'スコアが設定されていない場合の確認。',
      image: '/images/mock-image.webp',
      publishedAt: '2024-01-01',
    },
    rank: 6,
  },
}

export const LongTitle: Story = {
  args: {
    post: {
      id: '4',
      slug: '/posts/long-title',
      title: 'ハリー・ポッターと死の秘宝 PART2 〜最終決戦と永遠の絆〜（完全版・4K HDR）',
      excerpt: '',
      image: '/images/mock-image.webp',
      publishedAt: '2024-01-01',
      score: 4.0,
    },
    rank: 7,
  },
}
