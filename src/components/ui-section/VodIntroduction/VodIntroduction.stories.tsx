import type { Meta, StoryObj } from '@storybook/react-vite';
import { VodIntroduction } from './VodIntroduction';
import { mockPosts } from '@/mocks/post';

const meta = {
  title: 'UiSection/VodIntroduction',
  component: VodIntroduction,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof VodIntroduction>;

export default meta;
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// VodStreaming — VOD配信から執筆
// ---------------------------------------------------------------------------
export const VodStreaming: Story = {
  args: {
    title: '花束みたいな恋をした',
    writtenFrom: {
      type: 'vod',
      vodName: 'Amazon Prime Video',
      vodUrl: 'https://www.amazon.co.jp/prime-video',
      vodImageUrl: '/images/vod/amazon-prime-video.webp',
    },
    publishedAt: '2026-04-01',
    relatedPosts: mockPosts.slice(0, 3),
  },
};

// ---------------------------------------------------------------------------
// VodStreamingNoRelated — 関連投稿なし
// ---------------------------------------------------------------------------
export const VodStreamingNoRelated: Story = {
  args: {
    title: '花束みたいな恋をした',
    writtenFrom: {
      type: 'vod',
      vodName: 'Netflix',
      vodUrl: 'https://www.netflix.com',
    },
    publishedAt: '2026-04-01',
  },
};

// ---------------------------------------------------------------------------
// EnLocale
// ---------------------------------------------------------------------------
export const EnLocale: Story = {
  args: {
    title: 'A Bouquet of Clumsy Words',
    writtenFrom: {
      type: 'vod',
      vodName: 'Amazon Prime Video',
      vodUrl: 'https://www.amazon.co.jp/prime-video',
    },
    publishedAt: '2026-04-01',
  },
  globals: { locale: 'en' },
};
