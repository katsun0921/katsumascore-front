import type { Meta, StoryObj } from '@storybook/react-vite';
import { SayoStoryFrame } from '@/components/features/sayo/mocks/SayoStoryFrame';

/**
 * サヨを TOP・リストに置いた全体の動き。架空の SayoClient で通しで操作できる。
 * カードの「要約」→ モーダル →「詳しく知りたい」→ ノベル画面。
 */
const meta = {
  title: 'Features/Sayo/SayoProvider',
  component: SayoStoryFrame,
  parameters: { layout: 'fullscreen' },
  args: { view: 'top' },
} satisfies Meta<typeof SayoStoryFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

/** TOP：入口とカードの「要約」 */
export const Top: Story = {};

/** リスト（映画）：映画の記事の中から探す */
export const List: Story = { args: { view: 'list' } };

/** WordPress の停止フラグ ON：候補ボタン・要約は使え、自由入力の代わりに案内 */
export const Paused: Story = {
  args: { options: { status: { paused: true, message: '今月の会話の上限に達したため、サヨはお休み中です。12月1日から再開します。', resumeAt: '2026-12-01T00:00:00+09:00' } } },
};

/** 今日の回数を使い切った */
export const LimitReached: Story = { args: { options: { remaining: 0 } } };

/** WordPress の表示フラグ OFF：サヨのUIは何も出ない（カードは通常どおり） */
export const Hidden: Story = { args: { options: { status: { visible: false } } } };

/** フラグの取得に失敗：出さない側に倒す */
export const StatusError: Story = { args: { options: { statusFails: true } } };
