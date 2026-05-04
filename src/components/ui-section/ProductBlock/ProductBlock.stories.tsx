import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductBlock } from './ProductBlock';

/**
 * WordPress ACF + Gutenbergブロックとして記事内に挿入されるコンポーネント。
 * 実装本体はPHPだが、表示確認のためTSXで実装している。
 * Next.jsアプリからはimportされない。削除禁止。
 */
const meta: Meta<typeof ProductBlock> = {
  title: 'ui-section/ProductBlock',
  component: ProductBlock,
  tags: ['autodocs'],
};
export default meta;

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
};

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
};

export const NoImage: Story = {
  args: {
    type: 'vod',
    title: '進撃の巨人 The Final Season',
    links: [{ site: 'amazon_prime', url: 'https://amazon.co.jp/watch/456' }],
  },
};

export const WithImage: Story = {
  args: {
    type: 'shopping',
    title: '呪術廻戦 1巻',
    description: '芥見下々による人気漫画の第1巻。',
    imageUrl: '/images/sample.jpg',
    imageAlt: '呪術廻戦 1巻',
    links: [
      { site: 'amazon', url: 'https://amazon.co.jp/dp/456' },
    ],
  },
};

export const NoLinks: Story = {
  args: {
    type: 'vod',
    title: 'リンクなし作品',
    description: 'リンクが存在しないケース。',
    links: [],
  },
};

export const UnknownSite: Story = {
  args: {
    type: 'vod',
    title: '未知のサイト',
    links: [{ site: 'unknown_vod', url: 'https://example.com' }],
  },
};
