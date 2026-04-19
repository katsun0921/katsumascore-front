import type { Meta, StoryObj } from '@storybook/react-vite'
import { VideoEmbed } from './VideoEmbed'

const meta = {
  title: 'UI/VideoEmbed',
  component: VideoEmbed,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof VideoEmbed>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// YouTube URL
// ---------------------------------------------------------------------------
export const YouTubeUrl: Story = {
  args: {
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: 'Sample Video',
  },
}

// ---------------------------------------------------------------------------
// EmbedCode — 埋め込みコードで表示
// ---------------------------------------------------------------------------
export const EmbedCode: Story = {
  args: {
    embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
  },
}

// ---------------------------------------------------------------------------
// NoEmbed — 何も渡さない場合は null
// ---------------------------------------------------------------------------
export const NoEmbed: Story = {
  args: {},
}
