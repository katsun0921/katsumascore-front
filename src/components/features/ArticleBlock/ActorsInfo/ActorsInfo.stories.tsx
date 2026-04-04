import type { Meta, StoryObj } from '@storybook/react'
import { ActorsInfo } from './ActorsInfo'

const mockActors = [
  {
    character: '竈門炭治郎',
    actorName: '花江夏樹',
    actorUrl: '/actor/hanae-natsuki',
    description: '主人公。優しく家族思いな少年。',
    otherWorks: [
      { title: '東京グール', href: '/posts/tokyo-ghoul', character: '金木研' },
      { title: 'ヴィンランド・サガ', href: '/posts/vinland-saga', character: 'トルフィン' },
    ],
  },
  {
    character: '竈門禰豆子',
    actorName: '鬼頭明里',
    actorUrl: '/actor/kito-akari',
    description: '炭治郎の妹。鬼化してしまう。',
  },
]

const meta: Meta<typeof ActorsInfo> = {
  title: 'features/ArticleBlock/ActorsInfo',
  component: ActorsInfo,
  tags: ['autodocs'],
  args: { actors: mockActors, locale: 'ja' },
}
export default meta

type Story = StoryObj<typeof ActorsInfo>

export const Japanese: Story = { args: { locale: 'ja' } }
export const English: Story = {
  args: {
    actors: [
      { character: 'Tanjiro Kamado', actorName: 'Natsuki Hanae', actorUrl: '/actor/hanae' },
      { character: 'Nezuko Kamado', actorName: 'Akari Kito' },
    ],
    locale: 'en',
  },
}
export const NoOtherWorks: Story = {
  args: {
    actors: [{ character: '竈門炭治郎', actorName: '花江夏樹' }],
    locale: 'ja',
  },
}
