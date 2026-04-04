import type { Meta, StoryObj } from '@storybook/react'
import { GoodPoint } from './GoodPoint'

const meta: Meta<typeof GoodPoint> = {
  title: 'features/ArticleBlock/GoodPoint',
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
