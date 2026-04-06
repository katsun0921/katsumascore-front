import type { Meta, StoryObj } from '@storybook/react-vite'
import { OfficialSns } from './OfficialSns'

const meta: Meta<typeof OfficialSns> = {
  title: 'Layout/Sidebar/OfficialSns',
  component: OfficialSns,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// ── X タイムライン embed（snsUrl あり）
export const TwitterEmbed: Story = {
  args: {
    snsUrl: 'https://x.com/TokyoGhoul_PR',
  },
}

// ── YouTube embed（snsUrl なし・youtubeUrl フォールバック）
export const YouTubeEmbed: Story = {
  args: {
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
}

// ── YouTube 短縮 URL
export const YouTubeShortUrl: Story = {
  args: {
    youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ',
  },
}

// ── snsUrl・youtubeUrl 両方あり → X 優先表示
export const BothUrls: Story = {
  args: {
    snsUrl: 'https://x.com/TokyoGhoul_PR',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
}

// ── どちらもなし → null（非表示確認）
export const None: Story = {
  args: {
    snsUrl: undefined,
    youtubeUrl: undefined,
  },
}

// ── 英語ロケール（見出し "Official" に変化）
export const English: Story = {
  args: {
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  globals: { locale: 'en' },
}
