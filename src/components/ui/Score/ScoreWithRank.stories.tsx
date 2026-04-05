import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScoreWithRank } from './ScoreWithRank'

const meta: Meta<typeof ScoreWithRank> = {
  title: 'ui/ScoreWithRank',
  component: ScoreWithRank,
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

// 範囲外（アイコンなし）
export const OutOfRange: Story = {
  args: { value: 0.5 },
}

// max指定あり
export const WithMax: Story = {
  args: { value: 4, max: 5 },
}
