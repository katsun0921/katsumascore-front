import type { Meta, StoryObj } from '@storybook/react-vite'
import { PostHeroSummary } from './PostHeroSummary'

const meta: Meta<typeof PostHeroSummary> = {
  title: 'features/post/PostHeroSummary',
  component: PostHeroSummary,
  parameters: {
    layout: 'padded',
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
  args: {
    posterUrl: '/images/mock-image.webp',
    description:
      '富豪の作家ハーラン・スロンビーが自宅で死体となって発見される。警察は自殺と断定するが、謎の名探偵ブノワ・ブランは他殺を疑い独自の捜査を開始。豪華キャストが織りなすどんでん返しのミステリー。',
  },
}

export default meta

type Story = StoryObj<typeof PostHeroSummary>

export const Default: Story = {}

export const LongDescription: Story = {
  args: {
    description:
      '富豪の作家ハーラン・スロンビーが85歳の誕生日パーティーの翌朝、自宅の書斎で死体となって発見される。警察は自殺と断定するが、謎の名探偵ブノワ・ブランが何者かに依頼されて事件を調査し始める。容疑者は一癖も二癖もある家族全員。真相に近づくにつれ、意外な事実が次々と明らかになっていく。アガサ・クリスティーへのオマージュを込めた、どんでん返しに次ぐどんでん返しのミステリー大作。',
  },
}

export const NoImage: Story = {
  args: {
    posterUrl: '',
  },
}
