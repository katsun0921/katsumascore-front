import type { Meta, StoryObj } from '@storybook/react-vite';
import { HomeYoutubeFree } from './HomeYoutubeFree';
import type { YoutubeFreeItem } from './HomeYoutubeFree.types';

const meta: Meta<typeof HomeYoutubeFree> = {
  title: 'UI-Home/HomeYoutubeFree',
  component: HomeYoutubeFree,
  args: {
    title: 'YouTubeで無料配信中',
    freeLabel: '無料',
    note: '公式チャンネルの期間限定公開です。予告なく終了することがあります。',
    newLabel: 'NEW',
    watchLabel: 'YouTubeで観る →',
    startedAtSuffix: '〜 公開中',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0618', padding: '24px', maxWidth: '900px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const items: YoutubeFreeItem[] = [
  {
    id: '1',
    href: '/ja/movie/one-missed-call-2003',
    title: '着信アリ',
    image: '/images/mock-image.webp',
    score: 3.5,
    channelName: '【公式】プレシディオチャンネル',
    youtubeUrl: 'https://www.youtube.com/watch?v=example1',
    startedAtLabel: '9/8',
    isNew: true,
  },
  {
    id: '2',
    href: '/ja/movie/mock-movie-c',
    title: 'モック映画C',
    image: '/images/mock-image.webp',
    score: 3,
    channelName: '東宝MOVIEチャンネル',
    youtubeUrl: 'https://www.youtube.com/watch?v=example2',
    startedAtLabel: '7/20',
    isNew: false,
  },
  {
    id: '3',
    href: '/ja/anime/mock-anime-b',
    title: 'とても長いタイトルのアニメ作品名が入った場合の折り返しを確認する',
    image: null,
    channelName: 'アニメ公式チャンネル',
    isNew: false,
  },
];

export const Default: Story = {
  args: { items },
};

/** 全件が新着（キャンペーンが一斉に始まった直後の状態）。 */
export const AllNew: Story = {
  args: {
    items: items.map((item) => ({ ...item, isNew: true })),
  },
};

/** チャンネル名も配信開始日も未取得のケース。 */
export const MinimalData: Story = {
  args: {
    items: items.map(({ id, href, title, image }) => ({ id, href, title, image, isNew: false })),
  },
};

/** 横スクロールの確認用。 */
export const Many: Story = {
  args: {
    items: Array.from({ length: 10 }, (_, i) => ({
      ...items[0],
      id: String(i),
      title: `無料公開作品 ${i + 1}`,
      isNew: i < 2,
    })),
  },
};

/** 0件のときはセクションごと描画しない。 */
export const Empty: Story = {
  args: { items: [] },
};
