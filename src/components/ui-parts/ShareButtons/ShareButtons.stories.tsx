import type { Meta, StoryObj } from '@storybook/react-vite'
import { ShareButtons } from './ShareButtons'

const meta: Meta<typeof ShareButtons> = {
  title: 'Ui-Parts/ShareButtons',
  component: ShareButtons,
  tags: ['autodocs'],
  args: {
    url: 'https://katsumascore.blog/posts/kimetsu-review',
    title: '鬼滅の刃 刀鍛冶の里編 レビュー | KatsumaScore',
  },
}
export default meta

type Story = StoryObj<typeof ShareButtons>

export const Japanese: Story = {
  globals: { locale: 'ja' },
}

export const English: Story = {
  globals: { locale: 'en' },
  args: {
    title: 'Demon Slayer Review | KatsumaScore',
  },
}

export const LongTitle: Story = {
  args: {
    title: 'この記事は非常に長いタイトルを持っており、シェアボタンのレイアウトが崩れないかを確認するためのストーリーです | KatsumaScore',
  },
}
