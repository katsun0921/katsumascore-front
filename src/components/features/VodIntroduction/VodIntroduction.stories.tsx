import type { Meta, StoryObj } from '@storybook/react-vite'
import { VodIntroduction } from './VodIntroduction'
import { mockPosts } from '@/components/features/post/mocks/post'

const meta = {
  title: 'Features/VodIntroduction',
  component: VodIntroduction,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof VodIntroduction>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// VodStreaming — VOD配信から執筆
// ---------------------------------------------------------------------------
export const VodStreaming: Story = {
  args: {
    titleJp: '花束みたいな恋をした',
    titleEn: 'A Bouquet of Clumsy Words',
    writtenFrom: {
      type: 'vod',
      vodName: 'Amazon Prime Video',
      vodUrl: 'https://www.amazon.co.jp/prime-video',
      vodImageUrl: '/images/mock-image.webp',
    },
    publishedAt: '2026-04-01',
    relatedPosts: mockPosts.slice(0, 3),
  },
}

// ---------------------------------------------------------------------------
// VodStreamingNoRelated — 関連投稿なし
// ---------------------------------------------------------------------------
export const VodStreamingNoRelated: Story = {
  args: {
    titleJp: '花束みたいな恋をした',
    writtenFrom: {
      type: 'vod',
      vodName: 'Netflix',
      vodUrl: 'https://www.netflix.com',
    },
    publishedAt: '2026-04-01',
  },
}

// ---------------------------------------------------------------------------
// CinemaShowing — 劇場公開中
// ---------------------------------------------------------------------------
export const CinemaShowing: Story = {
  args: {
    titleJp: '機動戦士ガンダム ジークアクス',
    titleEn: 'Mobile Suit Gundam GQuuuuuuX',
    writtenFrom: {
      type: 'cinema',
      isShowing: true,
      cinemaUrl: 'https://example.com/cinema',
      officialUrl: 'https://example.com/official',
    },
    publishedAt: '2026-04-01',
  },
}

// ---------------------------------------------------------------------------
// CinemaEnded — 劇場公開終了
// ---------------------------------------------------------------------------
export const CinemaEnded: Story = {
  args: {
    titleJp: '花束みたいな恋をした',
    writtenFrom: {
      type: 'cinema',
      isShowing: false,
      officialUrl: 'https://example.com/official',
    },
    publishedAt: '2026-04-01',
  },
}

// ---------------------------------------------------------------------------
// EnLocale
// ---------------------------------------------------------------------------
export const EnLocale: Story = {
  args: {
    titleJp: '花束みたいな恋をした',
    titleEn: 'A Bouquet of Clumsy Words',
    writtenFrom: {
      type: 'vod',
      vodName: 'Amazon Prime Video',
      vodUrl: 'https://www.amazon.co.jp/prime-video',
    },
    publishedAt: '2026-04-01',
    locale: 'en',
  },
}
