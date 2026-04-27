import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdBanner } from './AdBanner';

const meta: Meta<typeof AdBanner> = {
  title: 'Features/AdBanner',
  component: AdBanner,
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
};

export default meta;
type Story = StoryObj<typeof AdBanner>

// ── バナー型（300×250 プレースホルダー）
export const Banner: Story = {
  args: {
    type: 'banner',
    // 実際は A8.net 等のアフィリエイト埋め込みHTMLが入る
    // Storybook では SVG プレースホルダーで代替
    bannerHtml: `
      <a href="#" target="_blank" rel="noopener noreferrer">
        <svg
          width="300" height="250"
          viewBox="0 0 300 250"
          xmlns="http://www.w3.org/2000/svg"
          style="display:block;background:#f3f4f6;border:1px dashed #d1d5db;"
        >
          <rect width="300" height="250" fill="#f3f4f6"/>
          <text x="150" y="120" text-anchor="middle" fill="#9ca3af" font-size="14" font-family="sans-serif">
            300 × 250
          </text>
          <text x="150" y="142" text-anchor="middle" fill="#9ca3af" font-size="12" font-family="sans-serif">
            アフィリエイトバナー
          </text>
        </svg>
      </a>
    `,
  },
};

// ── CTAボタン型（U-NEXT）
export const CtaUnext: Story = {
  args: {
    type: 'cta',
    label: 'U-NEXTで31日間無料視聴',
    url: 'https://video.unext.jp/',
    color: 'var(--color-unext)',
  },
};

// ── CTAボタン型（Amazon Prime Video）
export const CtaAmazon: Story = {
  args: {
    type: 'cta',
    label: 'Amazon Prime Videoで視聴',
    url: 'https://www.amazon.co.jp/primevideo',
    color: 'var(--color-amazon)',
  },
};

// ── CTAボタン型（Hulu）
export const CtaHulu: Story = {
  args: {
    type: 'cta',
    label: 'Huluで2週間無料トライアル',
    url: 'https://www.hulu.jp/',
    color: '#1ce783',
  },
};

// ── CTAボタン型（デフォルトカラー = primary blue）
export const CtaDefault: Story = {
  args: {
    type: 'cta',
    label: '動画配信サービスを探す',
    url: '/vod',
  },
};

// ── CTAボタン型（ラベルが長い・折り返し確認）
export const CtaLongLabel: Story = {
  args: {
    type: 'cta',
    label: 'U-NEXTなら見放題作品が23万本以上！今すぐ31日間無料で体験する',
    url: 'https://video.unext.jp/',
    color: 'var(--color-unext)',
  },
};
