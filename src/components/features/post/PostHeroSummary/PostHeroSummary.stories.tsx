import type { Meta, StoryObj } from '@storybook/react-vite'
import { PostHeroSummary } from './PostHeroSummary'

const meta: Meta<typeof PostHeroSummary> = {
  title: 'features/post/PostHeroSummary',
  component: PostHeroSummary,
  parameters: {
    layout: 'padded',
  },
  globals: {
    backgrounds: { value: 'light' },
  },
  args: {
    posterUrl: '/images/mock-image.webp',
    description:
      '富豪の作家ハーラン・スロンビーが自宅で死体となって発見される。警察は自殺と断定するが、謎の名探偵ブノワ・ブランは他殺を疑い独自の捜査を開始。豪華キャストが織りなすどんでん返しのミステリー。',
  },
}

export default meta

type Story = StoryObj<typeof PostHeroSummary>

export const HeroDefault: Story = {}

export const HeroLongDescription: Story = {
  args: {
    description:
      '富豪の作家ハーラン・スロンビーが85歳の誕生日パーティーの翌朝、自宅の書斎で死体となって発見される。警察は自殺と断定するが、謎の名探偵ブノワ・ブランが何者かに依頼されて事件を調査し始める。容疑者は一癖も二癖もある家族全員。真相に近づくにつれ、意外な事実が次々と明らかになっていく。アガサ・クリスティーへのオマージュを込めた、どんでん返しに次ぐどんでん返しのミステリー大作。',
  },
}

export const HeroNoImage: Story = {
  args: {
    posterUrl: '',
  },
}

export const ArticleJapanese: Story = {
  args: {
    text: '舞台は大正時代の日本。主人公の竈門炭治郎は、鬼に家族を殺され、唯一生き残った妹・禰豆子が鬼に変えられてしまう。炭治郎は妹を人間に戻すため、また家族を殺した鬼を討つために、鬼狩りの剣士「鬼殺隊」へと入隊する。',
    refUrl: 'https://kimetsu.com/',
    refLabel: '鬼滅の刃 公式サイト',
    locale: 'ja',
  },
}

export const ArticleEnglish: Story = {
  globals: { locale: 'en' },
  args: {
    text: 'Set in Taisho-era Japan, Tanjiro Kamado is a kind-hearted boy who sells charcoal for a living. His peaceful life is shattered when his family is slaughtered by a demon.',
    refUrl: 'https://kimetsu.com/en/',
    refLabel: 'Demon Slayer Official Site',
    locale: 'en',
  },
}

export const ArticleNoReference: Story = {
  args: {
    text: 'あらすじテキストのみで、出典なしのパターンです。',
    refUrl: undefined,
    refLabel: undefined,
    locale: 'ja',
  },
}
