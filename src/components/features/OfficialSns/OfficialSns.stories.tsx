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
      options: ['x', 'youtube', 'instagram'],
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

// ── YouTube のみ
export const YouTubeOnly: Story = {
  args: {
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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

// ── 全タブ（X / YouTube / Instagram）
export const AllTabs: Story = {
  args: {
    snsUrl: 'https://x.com/TokyoGhoul_PR',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    instagramUrl: 'https://www.instagram.com/TokyoGhoul_PR',
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
