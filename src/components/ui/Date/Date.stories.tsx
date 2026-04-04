import type { Meta, StoryObj } from '@storybook/react'
import { Date } from './Date'

const meta: Meta<typeof Date> = {
  title: 'ui/Date',
  component: Date,
  tags: ['autodocs'],
  args: {
    publishedAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    locale: 'ja',
  },
}
export default meta

type Story = StoryObj<typeof Date>

export const Japanese: Story = {
  args: { locale: 'ja' },
}

export const English: Story = {
  args: { locale: 'en' },
}

export const PublishedOnly: Story = {
  args: {
    publishedAt: '2024-03-15T00:00:00Z',
    updatedAt: undefined,
    locale: 'ja',
  },
}
