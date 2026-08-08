import type { Meta, StoryObj } from '@storybook/react-vite';
import { HomeReleaseHighlight } from './HomeReleaseHighlight';

const meta: Meta<typeof HomeReleaseHighlight> = {
  title: 'UI-Home/HomeReleaseHighlight',
  component: HomeReleaseHighlight,
  args: {
    theaterTitle: '今週の劇場公開',
    vodTitle: '今週のVOD配信開始',
    seeAllLabel: 'まとめ記事を見る →',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0618', padding: '24px', maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const theaterBlock = {
  href: '/theater-release/theater-release-2026-08-02',
  articleTitle: '今週公開の映画まとめ（2026年8月第1週）',
  works: [
    // 自サイトのレビュー記事があるケース
    { title: 'ゴースト・オブ・ウエノ', meta: '8月8日(土)公開', href: '/ja/movie/ghost-of-ueno', isExternal: false },
    // 公式サイト（外部）へのリンクのみのケース
    { title: '真夏の方程式 リブート', meta: '8月8日(土)公開', href: 'https://example.com/', isExternal: true },
    // リンクが無いケース
    { title: 'ミッドナイト・ランナウェイ', meta: '8月9日(日)公開' },
  ],
};

const vodBlock = {
  href: '/vod-release/vod-release-2026-08-02',
  articleTitle: '今週配信開始のVOD作品まとめ（2026年8月第1週）',
  works: [
    { title: 'スター・ウォーズ：ビジョンズ／九人目のジェダイ', meta: 'Disney+', href: 'https://www.disneyplus.com/', isExternal: true },
    { title: 'ストレンジャー・シングス シーズン5', meta: 'Netflix', href: '/ja/drama/stranger-things-5', isExternal: false },
    { title: '呪術廻戦 死滅回游編', meta: 'Prime Video' },
  ],
};

export const Default: Story = {
  args: {
    theater: theaterBlock,
    vod: vodBlock,
  },
};

export const LongTitle: Story = {
  args: {
    theater: {
      ...theaterBlock,
      works: [
        {
          title:
            'とても長いタイトルの映画作品名が入った場合の折り返し表示を確認するためのサンプル作品タイトル',
          meta: '8月8日(土)公開',
        },
        ...theaterBlock.works,
      ],
    },
    vod: vodBlock,
  },
};

export const MixedData: Story = {
  args: {
    theater: theaterBlock,
    vod: undefined,
  },
};

export const FallbackNoWorks: Story = {
  args: {
    theater: { ...theaterBlock, works: [] },
    vod: { ...vodBlock, works: [] },
  },
};

export const Dense: Story = {
  args: {
    theater: {
      ...theaterBlock,
      works: Array.from({ length: 6 }, (_, i) => ({
        title: `劇場公開作品 ${i + 1}`,
        meta: `8月${8 + i}日公開`,
      })),
    },
    vod: {
      ...vodBlock,
      works: Array.from({ length: 6 }, (_, i) => ({
        title: `VOD配信作品 ${i + 1}`,
        meta: ['Netflix', 'Prime Video', 'Disney+', 'U-NEXT', 'Hulu', 'DMM TV'][i],
      })),
    },
  },
};

export const Empty: Story = {
  args: {
    theater: undefined,
    vod: undefined,
  },
};
