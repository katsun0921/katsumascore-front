import type { Meta, StoryObj } from '@storybook/react'
import { BasicInfo } from './BasicInfo'

const meta: Meta<typeof BasicInfo> = {
  title: 'features/BasicInfo',
  component: BasicInfo,
  tags: ['autodocs'],
  args: {
    titleEn: 'Demon Slayer: Kimetsu no Yaiba',
    releaseDate: '20240407',
    officialUrl: 'https://kimetsu.com',
    officialSns: {
      x: { link: 'https://x.com/kimetsu_off' },
      youtube_channel: { link: 'https://youtube.com/@kimetsu' },
    },
    copyright: '© 吾峠呼世晴/集英社・アニプレックス・ufotable',
    locale: 'ja',
  },
}
export default meta

type Story = StoryObj<typeof BasicInfo>

export const Japanese: Story = { args: { locale: 'ja' } }
export const English: Story = { args: { locale: 'en' } }
export const Minimal: Story = {
  args: {
    titleEn: 'Demon Slayer',
    officialUrl: 'https://kimetsu.com',
    officialSns: undefined,
    locale: 'ja',
  },
}
