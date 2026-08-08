import type { Meta, StoryObj } from '@storybook/react-vite';
import { HomeReleaseHighlight } from './HomeReleaseHighlight';

const meta: Meta<typeof HomeReleaseHighlight> = {
  title: 'UI-Home/HomeReleaseHighlight',
  component: HomeReleaseHighlight,
  args: {
    theaterTitle: '劇場公開情報',
    vodTitle: 'VOD配信情報',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0618', padding: '24px', maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    theaterItem: {
      title: '今週公開の映画まとめ（2026年8月第1週）',
      publishedAt: '2026-08-08',
      href: '/theater-release/theater-release-2026-08-02',
    },
    vodItem: {
      title: '今週配信開始のVOD作品まとめ（2026年8月第1週）',
      publishedAt: '2026-08-08',
      href: '/vod-release/vod-release-2026-08-02',
    },
  },
};

export const LongTitle: Story = {
  args: {
    theaterItem: {
      title: '今週公開の映画まとめ（2026年8月第1週）とても長いタイトルが入った場合の折り返し表示テスト用サンプル',
      publishedAt: '2026-08-08',
      href: '/theater-release/theater-release-2026-08-02',
    },
    vodItem: {
      title: '今週配信開始のVOD作品まとめ（2026年8月第1週）とても長いタイトルが入った場合の折り返し表示テスト用サンプル',
      publishedAt: '2026-08-08',
      href: '/vod-release/vod-release-2026-08-02',
    },
  },
};

export const MixedData: Story = {
  args: {
    theaterItem: {
      title: '今週公開の映画まとめ（2026年8月第1週）',
      publishedAt: '2026-08-08',
      href: '/theater-release/theater-release-2026-08-02',
    },
    vodItem: undefined,
  },
};

export const Empty: Story = {
  args: {
    theaterItem: undefined,
    vodItem: undefined,
  },
};
