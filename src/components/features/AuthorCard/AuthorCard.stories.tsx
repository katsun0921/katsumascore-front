import type { Meta, StoryObj } from '@storybook/react'
import { AuthorCard } from './AuthorCard'

const meta: Meta<typeof AuthorCard> = {
  title: 'features/AuthorCard',
  component: AuthorCard,
  tags: ['autodocs'],
  args: {
    name: 'Katsuma',
    avatarUrl: 'https://placehold.co/200x200',
    profileUrl: '/author/katsuma',
    bio: '映画・アニメ・ドラマのレビューサイト「KatsumaScore」の管理人。好きなジャンルはSFとアクション。',
    headline: '映画・アニメレビュアー',
    socials: {
      twitter: 'https://x.com/katsuma',
      youtube: 'https://youtube.com/@katsuma',
    },
  },
}
export default meta

type Story = StoryObj<typeof AuthorCard>

export const Default: Story = {}
export const NoAvatar: Story = { args: { avatarUrl: undefined } }
export const NoBio: Story = { args: { bio: undefined } }
export const AllSocials: Story = {
  args: {
    socials: {
      twitter: 'https://x.com/katsuma',
      facebook: 'https://facebook.com/katsuma',
      instagram: 'https://instagram.com/katsuma',
      youtube: 'https://youtube.com/@katsuma',
      website: 'https://katsumascore.blog',
    },
  },
}
