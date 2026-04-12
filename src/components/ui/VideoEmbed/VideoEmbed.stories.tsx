import type { Meta, StoryObj } from '@storybook/react-vite'
import { VideoEmbed } from './VideoEmbed'

const meta = {
  title: 'Features/VideoEmbed',
  component: VideoEmbed,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof VideoEmbed>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// YouTube embed
// ---------------------------------------------------------------------------
export const YouTube: Story = {
  args: {
    embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
  },
}

// ---------------------------------------------------------------------------
// NoEmbed — embedCode が空の場合は何も表示しない
// ---------------------------------------------------------------------------
export const NoEmbed: Story = {
  args: {
    embedCode: '',
  },
}
