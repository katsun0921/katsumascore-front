import type { Meta, StoryObj } from '@storybook/react'
import { Summary } from './Summary'

const meta: Meta<typeof Summary> = {
  title: 'features/ArticleBlock/Summary',
  component: Summary,
  tags: ['autodocs'],
  args: {
    text: '舞台は大正時代の日本。主人公の竈門炭治郎は、鬼に家族を殺され、唯一生き残った妹・禰豆子が鬼に変えられてしまう。炭治郎は妹を人間に戻すため、また家族を殺した鬼を討つために、鬼狩りの剣士「鬼殺隊」へと入隊する。',
    refUrl: 'https://kimetsu.com/',
    refLabel: '鬼滅の刃 公式サイト',
    locale: 'ja',
  },
}
export default meta

type Story = StoryObj<typeof Summary>

export const Japanese: Story = { args: { locale: 'ja' } }

export const English: Story = {
  args: {
    text: 'Set in Taisho-era Japan, Tanjiro Kamado is a kind-hearted boy who sells charcoal for a living. His peaceful life is shattered when his family is slaughtered by a demon.',
    refUrl: 'https://kimetsu.com/en/',
    refLabel: 'Demon Slayer Official Site',
    locale: 'en',
  },
}

export const NoReference: Story = {
  args: {
    text: 'あらすじテキストのみで、出典なしのパターンです。',
    refUrl: undefined,
    refLabel: undefined,
    locale: 'ja',
  },
}
