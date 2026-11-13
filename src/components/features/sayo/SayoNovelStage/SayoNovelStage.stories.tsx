import type { Meta, StoryObj } from '@storybook/react-vite';
import { SayoStoryFrame } from '@/components/features/sayo/mocks/SayoStoryFrame';

/** 「詳しく知りたい」を押した後のノベル画面。SayoProvider の initial で開いた状態から始める */
const meta = {
  title: 'Features/Sayo/SayoNovelStage',
  component: SayoStoryFrame,
  parameters: { layout: 'fullscreen' },
  args: { view: 'top', initial: { summaryId: 1203, ids: [1201, 1202, 1203, 1204, 1205, 1206], novel: true } },
} satisfies Meta<typeof SayoStoryFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 作品の話：承認済み要約を読み上げ、選択肢と自由入力で聞く */
export const Post: Story = {};

/** 停止中：要約の読み上げまで。選択肢・入力の代わりに案内 */
export const Paused: Story = {
  args: { options: { status: { paused: true, message: '今月の会話の上限に達したため、サヨはお休み中です。', resumeAt: '2026-12-01T00:00:00+09:00' } } },
};

/** 回数を使い切った */
export const LimitReached: Story = { args: { options: { remaining: 0 } } };

/** ai-chat が受付終了（health の enabled: false）：質問を押すと止まる */
export const Closed: Story = { args: { options: { healthEnabled: false } } };

/** 返事の取得に失敗：「もう一度送る」 */
export const MessageError: Story = { args: { options: { forceMessageStatus: 'error' } } };

/** 動きを確かめやすいよう、応答を遅くする */
export const Slow: Story = { args: { options: { delayMs: 1500 } } };
