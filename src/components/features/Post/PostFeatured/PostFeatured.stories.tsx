import type { Meta, StoryObj } from '@storybook/react-vite'
import { PostFeatured } from './PostFeatured'

const meta: Meta<typeof PostFeatured> = {
  title: 'features/Post/PostFeatured',
  component: PostFeatured,
  parameters: { layout: 'padded' },
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
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoImage: Story = {
  args: {
    post: {
      id: '2',
      slug: '/posts/no-image',
      title: 'サムネイルなし作品',
      excerpt: '画像が存在しないケースのフォールバック確認。',
      image: null,
      publishedAt: '2024-01-01',
      score: 3.5,
    },
  },
}

export const NoScore: Story = {
  args: {
    post: {
      id: '3',
      slug: '/posts/no-score',
      title: 'スコアなし作品',
      excerpt: 'スコアが設定されていない場合の表示確認。',
      image: '/images/mock-image.webp',
      publishedAt: '2024-01-01',
    },
  },
}

export const LongTitle: Story = {
  args: {
    post: {
      id: '4',
      slug: '/posts/long-title',
      title: 'ハリー・ポッターと死の秘宝 PART2 〜最終決戦と永遠の絆〜（完全版・4K HDR）',
      excerpt: 'タイトルが非常に長い場合のレイアウト確認。',
      image: '/images/mock-image.webp',
      publishedAt: '2024-01-01',
      score: 4.2,
    },
  },
}

export const NoExcerpt: Story = {
  args: {
    post: {
      id: '5',
      slug: '/posts/no-excerpt',
      title: '抜粋なし作品',
      excerpt: '',
      image: '/images/mock-image.webp',
      publishedAt: '2024-01-01',
      score: 4.0,
    },
  },
}
