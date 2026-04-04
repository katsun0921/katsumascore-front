import type { Meta, StoryObj } from '@storybook/react'
import { CreditInfo } from './CreditInfo'

const mockCredits = [
  { role: '監督', names: ['外崎春雄'] },
  { role: 'キャラクターデザイン', names: ['松島晃'] },
  { role: '音楽', names: ['梶浦由記', 'Elliott Smith'] },
  { role: '制作', names: ['ufotable'] },
]

const meta: Meta<typeof CreditInfo> = {
  title: 'features/CreditInfo',
  component: CreditInfo,
  tags: ['autodocs'],
  args: { credits: mockCredits, locale: 'ja' },
}
export default meta

type Story = StoryObj<typeof CreditInfo>

export const Japanese: Story = { args: { locale: 'ja' } }
export const English: Story = {
  args: {
    credits: [
      { role: 'Director', names: ['Haruo Sotozaki'] },
      { role: 'Music', names: ['Yuki Kajiura'] },
      { role: 'Animation Studio', names: ['ufotable'] },
    ],
    locale: 'en',
  },
}
export const Single: Story = {
  args: { credits: [{ role: '監督', names: ['外崎春雄'] }] },
}
