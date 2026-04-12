import type { Meta, StoryObj } from '@storybook/react-vite'
import { SCORE_DISPLAY_MAX } from '@/lib/scoreDisplay'
import { ScoreWithRank } from './ScoreWithRank'

const meta: Meta<typeof ScoreWithRank> = {
  title: 'ui/ScoreWithRank',
  component: ScoreWithRank,
  args: {
    max: SCORE_DISPLAY_MAX,
  },
}

export default meta

type Story = StoryObj<typeof ScoreWithRank>

// 1.0〜2.0: rank C
export const RankC: Story = {
  args: { value: 1.5 },
}

// 2.0〜3.0: rank B
export const RankB: Story = {
  args: { value: 2.5 },
}

// 3.0〜4.0: rank A
export const RankA: Story = {
  args: { value: 3.5 },
}

// 4.0〜4.5: rank S
export const RankS: Story = {
  args: { value: 4.2 },
}

// 4.5〜5.0: rank SS
export const RankSS: Story = {
  args: { value: 4.8 },
}

// 最大値 5.0: rank SS
export const MaxScore: Story = {
  args: { value: 5.0 },
}

// 範囲外（アイコンなし・数値のみ）
export const OutOfRange: Story = {
  args: { value: 0.5 },
}

// imageOnly: ランクバッジ画像のみ表示
export const ImageOnly: Story = {
  args: { value: 4.3, imageOnly: true },
}

// imageOnly + アイコンなしスコア（null返却の確認）
export const ImageOnlyOutOfRange: Story = {
  args: { value: 0.5, imageOnly: true },
}

// 暗背景でランク色の確認
export const OnDarkBackground: Story = {
  render: (args) => (
    <div className='flex min-h-[280px] items-center justify-center bg-[var(--color-score-bg)] p-8'>
      <ScoreWithRank {...args} />
    </div>
  ),
  args: { value: 4.3 },
}
