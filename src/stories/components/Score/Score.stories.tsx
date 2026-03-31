import type { Meta, StoryObj } from '@storybook/react-vite'
import { Score } from './Score'

const meta: Meta<typeof Score> = {
  title: 'Components/Score',
  component: Score,
  argTypes: {
    score: {
      control: { type: 'select' },
      options: ['1', '2', '3', '4', '5'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
  },
}
export default meta
type Story = StoryObj<typeof meta>

export const Score1: Story = { args: { score: '1', size: 'medium' } }
export const Score3: Story = { args: { score: '3', size: 'medium' } }
export const Score5: Story = { args: { score: '5', size: 'medium' } }
export const SizeSmall: Story = { args: { score: '4', size: 'small' } }
export const SizeLarge: Story = { args: { score: '5', size: 'large' } }
