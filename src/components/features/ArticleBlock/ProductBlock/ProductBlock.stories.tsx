import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProductBlock } from './ProductBlock'

const meta: Meta<typeof ProductBlock> = {
  title: 'features/ArticleBlock/ProductBlock',
  component: ProductBlock,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof ProductBlock>

export const VodProduct: Story = {
  args: {
    type: 'vod',
    title: '鬼滅の刃 刀鍛冶の里編',
    description: 'Netflixで配信中の大人気アニメ第3期。',
    links: [
      { site: 'netflix', url: 'https://netflix.com/watch/123' },
      { site: 'amazon_prime', url: 'https://amazon.co.jp/watch/123' },
    ],
  },
}

export const ShoppingProduct: Story = {
  args: {
    type: 'shopping',
    title: '鬼滅の刃 23巻（完結）',
    description: '吾峠呼世晴による漫画の最終巻。',
    links: [
      { site: 'amazon', url: 'https://amazon.co.jp/dp/123' },
      { site: 'rakuten', url: 'https://books.rakuten.co.jp/rb/123' },
    ],
  },
}

export const NoImage: Story = {
  args: {
    type: 'vod',
    title: '進撃の巨人 The Final Season',
    links: [{ site: 'amazon_prime', url: 'https://amazon.co.jp/watch/456' }],
  },
}
