import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'ui/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { label: 'Badge' },
}
export default meta

type Story = StoryObj<typeof Badge>

export const Default: Story = { args: { label: 'デフォルト', variant: 'default' } }
export const Primary: Story = { args: { label: 'プライマリ', variant: 'primary' } }
export const Cinema: Story = { args: { label: '劇場公開中', variant: 'cinema' } }
export const Netflix: Story = { args: { label: 'Netflix', variant: 'netflix' } }
export const Amazon: Story = { args: { label: 'Amazon Prime', variant: 'amazon' } }
export const Unext: Story = { args: { label: 'U-NEXT', variant: 'unext' } }
