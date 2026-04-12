import type { Meta, StoryObj } from '@storybook/react-vite'
import { WorkInfo } from './WorkInfo'

const meta: Meta<typeof WorkInfo> = {
  title: 'Layout/Sidebar/WorkInfo',
  component: WorkInfo,
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

// ── スコアS・複数VOD配信中（基本）
export const Default: Story = {
  args: {
    score: 4.2,
    title: 'インターステラー',
    year: '2014',
    genre: 'SF',
    isCinema: false,
    vod: { unext: true, amazon: true, netflix: true },
  },
}

// ── スコアSS・全VOD配信中
export const HighScore: Story = {
  args: {
    score: 4.8,
    title: 'ショーシャンクの空に',
    year: '1994',
    genre: 'ヒューマンドラマ',
    isCinema: false,
    vod: { unext: true, amazon: true, hulu: true, netflix: true, disney: true },
  },
}

// ── スコアC・VODなし
export const LowScore: Story = {
  args: {
    score: 1.5,
    title: 'とある駄作',
    year: '2023',
    genre: 'アクション',
    isCinema: false,
    vod: {},
  },
}

// ── 劇場公開中（VODバッジ非表示・劇場バッジのみ）
export const CinemaShowing: Story = {
  args: {
    score: 4.0,
    title: 'デューン 砂の惑星 PART2',
    year: '2024',
    genre: 'SF',
    isCinema: true,
    vod: { unext: true, amazon: true },
  },
}

// ── アフィリエイト非対象のみ（Netflix + Disney+）
export const OnlyNonAffiliate: Story = {
  args: {
    score: 3.5,
    title: 'ストレンジャー・シングス',
    year: '2016',
    genre: 'SF / ホラー',
    isCinema: false,
    vod: { netflix: true, disney: false },
  },
}

// ── VODセクション非表示（全falseまたはvod未指定）
export const NoVod: Story = {
  args: {
    score: 3.0,
    title: '配信なし作品',
    year: '2010',
    genre: 'サスペンス',
    isCinema: false,
  },
}

// ── タイトルが長い
export const LongTitle: Story = {
  args: {
    score: 4.3,
    title: 'ハリー・ポッターと死の秘宝 PART2 〜最終決戦〜',
    year: '2011',
    genre: 'ファンタジー',
    isCinema: false,
    vod: { unext: true, amazon: true },
  },
}

// ── 英語ロケール
export const English: Story = {
  args: {
    ...Default.args,
    title: 'Interstellar',
  },
  globals: { locale: 'en' },
}
