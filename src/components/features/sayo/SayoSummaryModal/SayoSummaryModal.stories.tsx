import type { Meta, StoryObj } from '@storybook/react-vite';
import { SayoStoryFrame } from '@/components/features/sayo/mocks/SayoStoryFrame';

/** 要約モーダル。SayoProvider の initial で開いた状態から始める */
const meta = {
  title: 'Features/Sayo/SayoSummaryModal',
  component: SayoStoryFrame,
  parameters: { layout: 'fullscreen' },
  args: { view: 'top', initial: { summaryId: 1203, ids: [1201, 1202, 1203, 1204, 1205, 1206] } },
} satisfies Meta<typeof SayoStoryFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

/** カードの「要約」を押した後 */
export const Summary: Story = {};

/** 候補ボタン「怖すぎないホラー」を押した後（探した結果） */
export const Search: Story = { args: { initial: { searchChip: '怖すぎないホラー' } } };

/** 探した結果が見つからない（リストで「ワクワクしたい」…映画の中に該当なし、などの想定） */
export const NoMatch: Story = { args: { view: 'list', initial: { searchChip: '少しずつ観たい' } } };

/** 停止中でも要約は読める */
export const Paused: Story = { args: { options: { status: { paused: true } } } };
