import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  mockPostContent,
  mockPostContentCode,
  mockPostContentDefensive,
  mockPostContentFull,
  mockPostContentGutenberg,
  mockPostContentLinks,
  mockPostContentLists,
  mockPostContentMedia,
  mockPostContentTable,
  mockPostContentTypography,
} from '@/components/features/Post/mocks/post';
import { PostContent } from './PostContent';

const meta: Meta<typeof PostContent> = {
  title: 'Features/Post/PostContent',
  component: PostContent,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** 最小限の動作確認用（既存） */
export const Default: Story = {
  args: {
    content: mockPostContent.content,
  },
};

/** h1〜h6・テキスト装飾・blockquote */
export const Typography: Story = {
  args: {
    content: mockPostContentTypography.content,
  },
};

/** a タグのスタイル・ホバー・長いURL */
export const Links: Story = {
  args: {
    content: mockPostContentLinks.content,
  },
};

/** ul / ol / ネスト / wp-block-list / details */
export const Lists: Story = {
  args: {
    content: mockPostContentLists.content,
  },
};

/** img / wp-block-image / wp-caption / YouTube embed */
export const Media: Story = {
  args: {
    content: mockPostContentMedia.content,
  },
};

/** Pullquote / Button / Columns / Separator / Notice */
export const GutenbergBlocks: Story = {
  args: {
    content: mockPostContentGutenberg.content,
  },
};

/** wp-block-table・横スクロール・テーブル内ネスト要素 */
export const Table: Story = {
  args: {
    content: mockPostContentTable.content,
  },
};

/** インラインコード・preブロック・wp-block-preformatted */
export const Code: Story = {
  args: {
    content: mockPostContentCode.content,
  },
};

/** 長いURL折り返し・インラインサイズ上書き・空要素・float クリア */
export const Defensive: Story = {
  args: {
    content: mockPostContentDefensive.content,
  },
};

/** 全セクション統合：すべてのスタイルを一覧確認 */
export const FullContent: Story = {
  args: {
    content: mockPostContentFull.content,
  },
};
