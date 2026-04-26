import type { Meta, StoryObj } from '@storybook/react-vite'
import { PostHero } from './PostHero'

const meta: Meta<typeof PostHero> = {
  title: 'ui-section/PostHero',
  component: PostHero,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
  args: {
    title: 'ナイブズ・アウト／名探偵と刃の館の秘密',
    trailerYoutubeId: 'hLRMHi73BzQ',
    posterUrl: '/images/mock-image.webp',
    description:
      '富豪の作家ハーラン・スロンビーが自宅で死体となって発見される。警察は自殺と断定するが、謎の名探偵ブノワ・ブランは他殺を疑い独自の捜査を開始。',
  },
}

export default meta

type Story = StoryObj<typeof PostHero>

export const Default: Story = {}

export const LongTitle: Story = {
  args: {
    title: '劇場版『機動戦士ガンダム ジークアクス』はなぜここまで観客の感情を揺さぶるのかを演出と脚本から読み解く',
  },
}

export const NoTrailer: Story = {
  args: {
    trailerYoutubeId: undefined,
  },
}

export const English: Story = {
  globals: { locale: 'en' },
  args: {
    title: 'Knives Out',
    description:
      'When renowned crime novelist Harlan Thrombey is found dead the morning after his 85th birthday, eccentric detective Benoit Blanc investigates the family.',
  },
}
