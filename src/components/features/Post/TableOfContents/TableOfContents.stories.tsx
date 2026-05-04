import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableOfContents } from './TableOfContents';
import type { TocItem } from '@/libs/toc';

const meta: Meta<typeof TableOfContents> = {
  title: 'Features/Post/TableOfContents',
  component: TableOfContents,
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
type Story = StoryObj<typeof meta>

const h2Items = (count: number, offset = 0): TocItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `heading-${offset + i}`,
    text: `セクション ${offset + i + 1}：${['序章', '登場人物', '世界観', '見どころ', '総評', '結末考察', 'スタッフ紹介', '受賞歴', '続編情報', '関連作品', '参考文献', '補足'][i % 12]}`,
    level: 2 as const,
  }));

const mixedItems: TocItem[] = [
  { id: 'h-0', text: '作品概要', level: 2 },
  { id: 'h-1', text: 'あらすじ', level: 3 },
  { id: 'h-2', text: '見どころ', level: 2 },
  { id: 'h-3', text: '映像・音楽', level: 3 },
  { id: 'h-4', text: '演技', level: 3 },
  { id: 'h-5', text: '総評', level: 2 },
  { id: 'h-6', text: 'スコアの根拠', level: 3 },
];

// ── h2 × 5（基本）
export const Default: Story = {
  args: { items: h2Items(5) },
};

// ── h2 × 2（最小）
export const Short: Story = {
  args: {
    items: [
      { id: 'h-0', text: 'はじめに', level: 2 },
      { id: 'h-1', text: 'まとめ', level: 2 },
    ],
  },
};

// ── h2 + h3 混在
export const WithH3: Story = {
  args: { items: mixedItems },
};

// ── 10項目以上（スクロール表示確認）
export const Long: Story = {
  args: { items: h2Items(12) },
};

// ── 英語ロケール（見出し「Contents」に変化）
export const English: Story = {
  args: {
    items: [
      { id: 'h-0', text: 'Overview', level: 2 },
      { id: 'h-1', text: 'Story', level: 3 },
      { id: 'h-2', text: 'Highlights', level: 2 },
      { id: 'h-3', text: 'Review', level: 2 },
    ],
  },
  globals: { locale: 'en' },
};

// ── 空（何も表示しない確認）
export const Empty: Story = {
  args: { items: [] },
};
