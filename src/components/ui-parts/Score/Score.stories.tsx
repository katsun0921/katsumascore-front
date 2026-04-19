import type { Meta, StoryObj } from '@storybook/react-vite'
import { SCORE_DISPLAY_MAX } from '@/lib/scoreDisplay'
import { Score } from './Score'

const meta: Meta<typeof Score> = {
  title: 'ui-parts/Score',
  component: Score,
  args: {
    max: SCORE_DISPLAY_MAX,
  },
}

export default meta

type Story = StoryObj<typeof Score>

export const Default: Story = {
  args: { value: 3.5 },
}

export const Min: Story = {
  args: { value: 1.0 },
}

export const Max: Story = {
  args: { value: 5.0 },
}
