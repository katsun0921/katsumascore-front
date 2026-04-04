import type { Meta, StoryObj } from '@storybook/react'
import { AdRental } from './AdRental'

const meta: Meta<typeof AdRental> = {
  title: 'features/ArticleBlock/AdRental',
  component: AdRental,
  tags: ['autodocs'],
  args: {
    titleJp: '鬼滅の刃',
    services: [
      { service: 'tsutaya', url: 'https://tsutaya.tsite.jp/item/123' },
      { service: 'geo', url: 'https://geo.jp/item/123' },
    ],
    locale: 'ja',
  },
}
export default meta

type Story = StoryObj<typeof AdRental>

export const BothServices: Story = {}
export const TsutayaOnly: Story = {
  args: { services: [{ service: 'tsutaya', url: 'https://tsutaya.tsite.jp/item/123' }] },
}
export const English: Story = { args: { locale: 'en' } }
