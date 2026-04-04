import type { Meta, StoryObj } from '@storybook/react'
import { ArticleHeader } from './ArticleHeader'

const meta: Meta<typeof ArticleHeader> = {
  title: 'features/ArticleHeader',
  component: ArticleHeader,
  tags: ['autodocs'],
  args: {
    titleJp: '鬼滅の刃 刀鍛冶の里編 レビュー',
    titleEn: 'Demon Slayer: Swordsmith Village Arc Review',
    publishedAt: '2024-04-15T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    categories: [
      { label: 'アニメ', href: '/category/anime' },
      { label: 'レビュー', href: '/category/review' },
    ],
    imageUrl: 'https://placehold.co/1200x675',
    imageAlt: '鬼滅の刃',
    locale: 'ja',
  },
}
export default meta

type Story = StoryObj<typeof ArticleHeader>

export const Japanese: Story = { args: { locale: 'ja' } }
export const English: Story = { args: { locale: 'en' } }
export const NoImage: Story = {
  args: { imageUrl: undefined, imageAlt: undefined, locale: 'ja' },
}
export const NoCategories: Story = {
  args: { categories: [], locale: 'ja' },
}
