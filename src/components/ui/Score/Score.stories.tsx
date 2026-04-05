import type { Meta, StoryObj } from '@storybook/react-vite'
import { Score } from './Score'

const meta: Meta<typeof Score> = {
  title: 'ui/Score',
  component: Score,
}

export default meta

type Story = StoryObj<typeof Score>

export const Default: Story = {
  args: { value: 3.5 },
}

export const WithMax: Story = {
  args: { value: 4, max: 5 },
}

export const Min: Story = {
  args: { value: 1.0 },
}

export const Max: Story = {
  args: { value: 5.0 },
}
