import type { Meta, StoryObj } from '@storybook/react-vite'
import { GoodPoint } from './PostGoodPoint'

const meta: Meta<typeof GoodPoint> = {
  title: 'features/GoodPoint',
  component: GoodPoint,
  tags: ['autodocs'],
  args: {
    points: [
      '圧倒的な作画クオリティ',
      '感情を揺さぶるストーリー展開',
      '個性豊かなキャラクターたち',
    ],
    locale: 'ja',
  },
}
export default meta

type Story = StoryObj<typeof GoodPoint>

export const Japanese: Story = { args: { locale: 'ja' } }

export const English: Story = {
  args: {
    points: ['Outstanding animation quality', 'Emotionally gripping story', 'Memorable characters'],
    locale: 'en',
  },
}

export const SinglePoint: Story = {
  args: {
    points: ['唯一のおすすめポイントです。'],
    locale: 'ja',
  },
}

export const WithRankBadge: Story = {
  args: {
    score: 4.3,
  },
}

export const WithRankBadgeNoRank: Story = {
  args: {
    score: 0.5,
  },
}
