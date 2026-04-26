import type { Meta, StoryObj } from '@storybook/react-vite'
import { PostDate } from './Date'

const meta: Meta<typeof PostDate> = {
  title: 'Features/Post/PostDate',
  component: PostDate,
  tags: ['autodocs'],
  args: {
    publishedAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
}
export default meta

type Story = StoryObj<typeof PostDate>

export const Japanese: Story = {}

export const English: Story = { globals: { locale: 'en' } }

export const PublishedOnly: Story = {
  args: {
    publishedAt: '2024-03-15T00:00:00Z',
    updatedAt: undefined,
  },
}
