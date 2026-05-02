import type { Meta, StoryObj } from '@storybook/react-vite';
import { OfficialSns } from './OfficialSns';

const meta: Meta<typeof OfficialSns> = {
  title: 'features/OfficialSns',
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
  argTypes: {
    initialTab: {
      control: 'select',
      options: ['x', 'youtube', 'instagram', 'tiktok'],
    },
    forceVisible: { control: 'boolean' },
    forceLoading: { control: 'boolean' },
  },
  args: {
    forceVisible: true,
    forceLoading: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>

// ── X のみ
export const XOnly: Story = {
  args: {
    snsUrl: 'https://x.com/TokyoGhoul_PR',
    forceVisible: true,
    forceLoading: false,
  },
};

// ── X 単体ツイート（blockquote 埋め込み）— プロフィールタイムラインより優先
export const XTweetEmbed: Story = {
  args: {
    snsUrl: undefined,
    xEmbedHtml:
      '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Sample post for Storybook.</p>&mdash; Sample (@hyakuemu_anime) <a href="https://twitter.com/hyakuemu_anime/status/2049035899766202624?ref_src=twsrc%5Etfw">April 28, 2026</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>',
    forceVisible: true,
    forceLoading: false,
  },
};

// ── YouTube のみ
export const YouTubeOnly: Story = {
  args: {
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    forceVisible: true,
    forceLoading: false,
  },
};

// ── Instagram 投稿埋め込み（blockquote）— data-instgrm-permalink から iframe を生成
export const InstagramPostEmbed: Story = {
  args: {
    instagramUrl: 'https://www.instagram.com/p/CUbHfhpswxt/',
    instagramEmbedHtml:
      '<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/CUbHfhpswxt/" data-instgrm-version="14"></blockquote> <script async src="//www.instagram.com/embed.js"></script>',
    forceVisible: true,
    forceLoading: false,
  },
};

// ── TikTok のみ（動画 URL）
export const TikTokOnly: Story = {
  args: {
    tiktokUrl: 'https://www.tiktok.com/@tiktok/video/7239859049826656567',
    forceVisible: true,
    forceLoading: false,
  },
};

// ── X + YouTube タブ切替
export const XAndYouTube: Story = {
  args: {
    snsUrl: 'https://x.com/TokyoGhoul_PR',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    initialTab: 'x',
    forceVisible: true,
    forceLoading: false,
  },
};

// ── 全タブ（X / YouTube / Instagram / TikTok）
export const AllTabs: Story = {
  args: {
    snsUrl: 'https://x.com/TokyoGhoul_PR',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    instagramUrl: 'https://www.instagram.com/TokyoGhoul_PR',
    tiktokUrl: 'https://www.tiktok.com/@tiktok/video/7239859049826656567',
    initialTab: 'x',
    forceVisible: true,
    forceLoading: false,
  },
};

// ── YouTube タブ初期表示
export const InitialTabYouTube: Story = {
  args: {
    snsUrl: 'https://x.com/TokyoGhoul_PR',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    initialTab: 'youtube',
    forceVisible: true,
    forceLoading: false,
  },
};

// ── Skeleton 強制表示
export const SkeletonLoading: Story = {
  args: {
    snsUrl: 'https://x.com/TokyoGhoul_PR',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    forceVisible: true,
    forceLoading: true,
  },
};

// ── IntersectionObserver 未発火（ビューポート外）
export const NotVisible: Story = {
  args: {
    snsUrl: 'https://x.com/TokyoGhoul_PR',
    forceVisible: false,
    forceLoading: false,
  },
};

// ── URL なし → null（非表示確認）
export const None: Story = {
  args: {
    snsUrl: undefined,
    youtubeUrl: undefined,
    instagramUrl: undefined,
    tiktokUrl: undefined,
  },
};

// ── 英語ロケール
export const English: Story = {
  args: {
    snsUrl: 'https://x.com/TokyoGhoul_PR',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    initialTab: 'x',
    forceVisible: true,
    forceLoading: false,
  },
  globals: { locale: 'en' },
};
