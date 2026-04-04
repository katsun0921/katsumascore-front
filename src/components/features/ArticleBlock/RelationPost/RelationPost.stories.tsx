import type { Meta, StoryObj } from '@storybook/react'
import { RelationPost } from './RelationPost'

const mockPosts = [
  { id: 1, title: '鬼滅の刃 遊郭編 レビュー', href: '/posts/kimetsu-yuukaku', imageUrl: 'https://placehold.co/400x225', imageAlt: '鬼滅の刃' },
  { id: 2, title: '鬼滅の刃 刀鍛冶の里編 レビュー', href: '/posts/kimetsu-katanakaji', imageUrl: 'https://placehold.co/400x225', imageAlt: '鬼滅の刃' },
  { id: 3, title: '鬼滅の刃 柱稽古編 レビュー', href: '/posts/kimetsu-hashira', imageUrl: 'https://placehold.co/400x225', imageAlt: '鬼滅の刃' },
]

const meta: Meta<typeof RelationPost> = {
  title: 'features/ArticleBlock/RelationPost',
  component: RelationPost,
  tags: ['autodocs'],
  args: { posts: mockPosts, locale: 'ja' },
}
export default meta

type Story = StoryObj<typeof RelationPost>

export const ThreeColumns: Story = {}
export const TwoColumns: Story = {
  args: { posts: mockPosts.slice(0, 2) },
}
export const NoImages: Story = {
  args: {
    posts: mockPosts.map(({ imageUrl: _, imageAlt: __, ...rest }) => rest),
  },
}
export const English: Story = {
  args: {
    posts: [
      { id: 1, title: 'Demon Slayer: Entertainment District Arc Review', href: '/posts/ds-entertainment' },
      { id: 2, title: 'Demon Slayer: Swordsmith Village Arc Review', href: '/posts/ds-swordsmith' },
    ],
    locale: 'en',
  },
}
