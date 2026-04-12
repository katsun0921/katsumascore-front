import type { Meta, StoryObj } from '@storybook/react-vite'
import { VideoEmbed } from './VideoEmbed'

const meta: Meta<typeof VideoEmbed> = {
  title: 'ui/VideoEmbed',
  component: VideoEmbed,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof VideoEmbed>

export const YouTubeUrl: Story = {
  args: {
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: 'Sample Video',
  },
}

export const EmbedCode: Story = {
  args: {
    embedCode:
      '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allowfullscreen></iframe>',
  },
}

export const Empty: Story = {
  args: {},
}
