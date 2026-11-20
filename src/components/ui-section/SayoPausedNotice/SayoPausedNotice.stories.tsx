import type { Meta, StoryObj } from '@storybook/react-vite';
import { SayoPausedNotice } from './SayoPausedNotice';

const meta = {
  title: 'UI-Section/Sayo/SayoPausedNotice',
  component: SayoPausedNotice,
  parameters: { layout: 'padded' },
  args: { reason: 'paused' },
  decorators: [
    (Story) => (
      <div className='max-w-xl bg-[var(--color-sayo-paper)] p-4'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SayoPausedNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

/** WordPress の案内文が空（既定文） */
export const PausedDefault: Story = {};

/** WordPress の案内文と再開予定あり */
export const PausedWithMessage: Story = {
  args: { message: '今月の会話の上限に達したため、サヨはお休み中です。12月1日から再開します。', resumeAt: '2026-12-01T00:00:00+09:00' },
};

/** 回数の上限 */
export const Limit: Story = { args: { reason: 'limit' } };

/** ai-chat が受付終了（health の enabled: false） */
export const Closed: Story = { args: { reason: 'closed' } };

/** 暗い背景（入口・ノベル画面） */
export const Dark: Story = {
  args: { tone: 'dark', message: '今月の会話の上限に達したため、サヨはお休み中です。' },
  decorators: [(Story) => <div className='bg-[var(--color-sayo-stage)] p-4'><Story /></div>],
};

/** 異常系：120字の案内文・読めない再開日時 */
export const LongText: Story = {
  args: {
    message: 'いつもサヨとお話しいただきありがとうございます。今月はたくさんの方にお越しいただき、会話の上限に達しました。来月のはじめから、また棚の前でお待ちしています。それまでは、要約と気分の候補ボタンをお使いください。',
    resumeAt: 'not-a-date',
  },
};
