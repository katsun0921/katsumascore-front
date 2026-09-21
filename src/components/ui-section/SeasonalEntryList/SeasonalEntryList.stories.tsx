import type { Meta, StoryObj } from '@storybook/react-vite';
import { SeasonalEntryList } from './SeasonalEntryList';

const meta: Meta<typeof SeasonalEntryList> = {
  title: 'ui-section/SeasonalEntryList',
  component: SeasonalEntryList,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof SeasonalEntryList>;

export const Default: Story = {
  args: {
    category: 'anime' as const,
    items: [
      {
        postId: 1,
        title: 'あかね噺',
        memo: '落語をバトル漫画の文法で見せる新機軸。今期でいちばん「題材の勝ち」を感じた一本。',
        href: '/ja/anime/akane-banashi',
      },
      {
        postId: 2,
        title: '淡島百景',
        memo: '時間軸が交錯する少女群像劇。後半で因果が収束していく構成が見事。',
        href: '/ja/anime/awashima-hyakkei',
      },
    ],
  },
};

/** 一口メモが未入力の行はタイトルのみを表示する */
export const WithoutMemo: Story = {
  args: {
    category: 'drama' as const,
    items: [
      {
        postId: 3,
        title: 'スパイダー・ノワール',
        memo: '',
        href: '/ja/drama/spider-noir',
      },
    ],
  },
};

/** 個別記事がまだ無い（パスを解決できない）場合はリンクにしない */
export const WithoutLink: Story = {
  args: {
    category: 'movie' as const,
    items: [
      {
        postId: 4,
        title: '未公開の作品',
        memo: '個別記事が未作成のため、リンクにはならない。',
        href: null,
      },
    ],
  },
};
