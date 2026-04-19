import type { Meta, StoryObj } from '@storybook/react-vite'
import { Breadcrumb } from './Breadcrumb'

const meta: Meta<typeof Breadcrumb> = {
  title: 'Ui-Parts/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Breadcrumb>

export const Home: Story = {
  args: { items: [{ label: 'Home', href: '/' }] },
}

export const Category: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'アニメ', href: '/category/anime' },
    ],
  },
}

export const Post: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'アニメ', href: '/category/anime' },
      { label: '鬼滅の刃 刀鍛冶の里編' },
    ],
  },
}

export const Long: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'アニメ', href: '/category/anime' },
      { label: 'シーズン別アニメレビュー', href: '/category/seasonal' },
      { label: '2024年冬アニメ', href: '/category/2024-winter' },
      { label: '鬼滅の刃 柱稽古編 第1話レビュー' },
    ],
  },
}
