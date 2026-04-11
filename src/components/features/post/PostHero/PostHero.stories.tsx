import type { Meta, StoryObj } from '@storybook/react-vite'
import { PostHero } from './PostHero'

const meta: Meta<typeof PostHero> = {
  title: 'features/post/PostHero',
  component: PostHero,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
  args: {
    titleJa: 'ナイブズ・アウト／名探偵と刃の館の秘密',
    trailerYoutubeId: 'hLRMHi73BzQ',
    posterUrl: '/images/mock-image.webp',
    description:
      '富豪の作家ハーラン・スロンビーが自宅で死体となって発見される。警察は自殺と断定するが、謎の名探偵ブノワ・ブランは他殺を疑い独自の捜査を開始。',
    score: 4.3,
    authorComment:
      '巧みな構成と豪華キャストが噛み合った、現代ミステリーの傑作。観る者を翻弄するどんでん返しが痛快。',
  },
}

export default meta

type Story = StoryObj<typeof PostHero>

export const Default: Story = {}

export const HighScore: Story = {
  args: {
    score: 4.8,
    titleJa: 'パラサイト 半地下の家族',
    authorComment: '映画史に刻まれる一本。完璧な脚本、演出、演技が三位一体となった奇跡の作品。',
  },
}

export const LowScore: Story = {
  args: {
    score: 1.8,
    titleJa: 'つまらない映画',
    authorComment: '期待を大きく裏切る内容。キャラクター描写が浅く、没入できなかった。',
  },
}

export const LongTitle: Story = {
  args: {
    titleJa: '劇場版『機動戦士ガンダム ジークアクス』はなぜここまで観客の感情を揺さぶるのかを演出と脚本から読み解く',
  },
}

export const English: Story = {
  globals: { locale: 'en' },
  args: {
    titleJa: 'Knives Out',
    description:
      'When renowned crime novelist Harlan Thrombey is found dead the morning after his 85th birthday, eccentric detective Benoit Blanc investigates the family.',
    authorComment: 'A masterclass in modern mystery filmmaking with a superb cast and clever twists.',
  },
}
