import type { Meta, StoryObj } from '@storybook/react-vite'
import { PostHeroScore } from './PostHeroScore'

const meta: Meta<typeof PostHeroScore> = {
  title: 'features/post/PostHeroScore',
  component: PostHeroScore,
  parameters: {
    layout: 'padded',
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
  args: {
    score: 4.3,
    comment: '巧みな構成と豪華キャストが噛み合った、現代ミステリーの傑作。観る者を翻弄するどんでん返しが痛快。',
  },
}

export default meta

type Story = StoryObj<typeof PostHeroScore>

export const Default: Story = {}

export const HighScore: Story = {
  args: {
    score: 4.8,
    comment: '映画史に刻まれる一本。完璧な脚本、演出、演技が三位一体となった奇跡の作品。',
  },
}

export const LowScore: Story = {
  args: {
    score: 1.8,
    comment: '期待を大きく裏切る内容。キャラクター描写が浅く、ストーリーの展開も散漫で没入できなかった。',
  },
}

export const LongComment: Story = {
  args: {
    score: 4.0,
    comment:
      '前半のテンポの良さと後半の感情的な重厚さが絶妙なバランスで共存しており、観終わった後にじわじわと余韻が広がっていく。脚本の緻密さと俳優陣の演技が見事に融合した、数年に一度出会えるかどうかの作品。もう一度、劇場で観たい。',
  },
}
