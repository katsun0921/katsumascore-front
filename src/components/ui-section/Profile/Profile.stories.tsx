import type { Meta, StoryObj } from '@storybook/react-vite'
import { Profile } from './Profile'

const meta: Meta<typeof Profile> = {
  title: 'ui-section/Profile',
  component: Profile,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const baseArgs = {
  name: 'Katsuma',
  description: '映画好きのKatsumaが独自スコアでレビューするブログ。年間200本以上鑑賞。',
  comment: '最近はSF映画にハマってます。特にクリストファー・ノーラン作品は何度見ても飽きません！',
  avatarUrl: '/images/mock-avatar.webp',
  aboutUrl: '/about',
  social: {
    x: 'https://x.com/Katsun0921',
  },
}

export const Default: Story = {
  args: baseArgs,
}

export const NoComment: Story = {
  args: { ...baseArgs, comment: undefined },
}

export const NoSocial: Story = {
  args: { ...baseArgs, social: undefined },
}

export const Minimal: Story = {
  args: { ...baseArgs, comment: undefined, social: undefined },
}

export const LongDescription: Story = {
  args: {
    ...baseArgs,
    description:
      '映画好きのKatsumaが独自スコアでレビューするブログです。年間200本以上を鑑賞し、ハリウッド大作からインディーズ、アジア映画まで幅広くカバーしています。スコアは感情だけでなく、演出・脚本・音楽の観点から総合的に評価しています。',
  },
}

export const LongComment: Story = {
  args: {
    ...baseArgs,
    comment:
      '最近はSF映画にハマってます。特にクリストファー・ノーラン作品は何度見ても飽きません！インターステラーは人生で一番好きな映画です。次はデューンのパート2が楽しみ！皆さんのおすすめも教えてください。',
  },
}

export const English: Story = {
  args: baseArgs,
  globals: { locale: 'en' },
}
