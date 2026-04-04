import type { Meta, StoryObj } from '@storybook/react'
import { CinemaCheck } from './CinemaCheck'

const meta: Meta<typeof CinemaCheck> = {
  title: 'features/ArticleBlock/CinemaCheck',
  component: CinemaCheck,
  tags: ['autodocs'],
  args: {
    isCinemaShowing: true,
    titleJp: '鬼滅の刃 柱稽古編',
    locale: 'ja',
  },
}
export default meta

type Story = StoryObj<typeof CinemaCheck>

export const Showing: Story = { args: { isCinemaShowing: true } }
export const NotShowing: Story = { args: { isCinemaShowing: false } }
export const English: Story = {
  args: {
    isCinemaShowing: true,
    titleJp: 'Demon Slayer',
    locale: 'en',
  },
}
