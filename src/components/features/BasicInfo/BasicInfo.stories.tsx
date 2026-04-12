import type { Meta, StoryObj } from '@storybook/react-vite'
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
      youtube_channel: { link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      instagram: { link: 'https://www.instagram.com/kimetsu_off' },
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
export const WithCredits: Story = {
  args: {
    locale: 'ja',
    credits: [
      { role: '監督', names: ['外崎春雄'] },
      { role: 'キャラクターデザイン', names: ['松島晃'] },
      { role: '音楽', names: ['梶浦由記', 'Elliott Smith'] },
      { role: '制作', names: ['ufotable'] },
    ],
  },
}
