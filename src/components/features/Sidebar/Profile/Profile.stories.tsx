import type { Meta, StoryObj } from '@storybook/react-vite'
import { Profile } from './Profile'

const meta: Meta<typeof Profile> = {
  title: 'Layout/Sidebar/Profile',
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
    instagram: 'https://instagram.com/katsumascore',
  },
}

// ── 全要素表示
export const Default: Story = {
  args: baseArgs,
}

// ── コメントなし
export const NoComment: Story = {
  args: {
    ...baseArgs,
    comment: undefined,
  },
}

// ── SNSリンクなし
export const NoSocial: Story = {
  args: {
    ...baseArgs,
    social: undefined,
  },
}

// ── コメント・SNSなし（最小構成）
export const Minimal: Story = {
  args: {
    ...baseArgs,
    comment: undefined,
    social: undefined,
  },
}

// ── 説明文が長い（折り返し確認）
export const LongDescription: Story = {
  args: {
    ...baseArgs,
    description:
      '映画好きのKatsumaが独自スコアでレビューするブログです。年間200本以上を鑑賞し、ハリウッド大作からインディーズ、アジア映画まで幅広くカバーしています。スコアは感情だけでなく、演出・脚本・音楽の観点から総合的に評価しています。',
  },
}

// ── コメントが長い（吹き出し折り返し確認）
export const LongComment: Story = {
  args: {
    ...baseArgs,
    comment:
      '最近はSF映画にハマってます。特にクリストファー・ノーラン作品は何度見ても飽きません！インターステラーは人生で一番好きな映画です。次はデューンのパート2が楽しみ！皆さんのおすすめも教えてください。',
  },
}

// ── 英語ロケール
export const English: Story = {
  args: baseArgs,
  globals: { locale: 'en' },
}
