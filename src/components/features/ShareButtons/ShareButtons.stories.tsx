import type { Meta, StoryObj } from '@storybook/react-vite'
import { ShareButtons } from './ShareButtons'

const meta: Meta<typeof ShareButtons> = {
  title: 'features/ShareButtons',
  component: ShareButtons,
  tags: ['autodocs'],
  args: {
    url: 'https://katsumascore.blog/posts/kimetsu-review',
    title: '鬼滅の刃 刀鍛冶の里編 レビュー | KatsumaScore',
    locale: 'ja',
  },
}
export default meta

type Story = StoryObj<typeof ShareButtons>

export const Japanese: Story = { args: { locale: 'ja' } }
export const English: Story = {
  args: {
    title: 'Demon Slayer Review | KatsumaScore',
    locale: 'en',
  },
}
