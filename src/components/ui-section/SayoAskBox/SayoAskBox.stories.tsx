import type { Meta, StoryObj } from '@storybook/react-vite';
import { SayoPausedNotice } from '@/components/ui-section/SayoPausedNotice';
import { sayoMockChips } from '@/mocks/sayo';
import { SayoAskBox } from './SayoAskBox';

const chips = sayoMockChips.map((c) => c.label);

const meta = {
  title: 'UI-Section/Sayo/SayoAskBox',
  component: SayoAskBox,
  parameters: { layout: 'padded' },
  args: { chips, onChip: () => {}, onSubmit: () => {} },
  decorators: [
    (Story) => (
      <div className='bg-[var(--color-bg-dark)] p-4'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SayoAskBox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** TOP：すべての記事から */
export const Top: Story = {};

/** リスト：そのカテゴリの中から */
export const List: Story = { args: { category: '映画' } };

/** 停止中：自由入力の代わりに案内（候補ボタンは使える） */
export const Paused: Story = {
  args: {
    onSubmit: undefined,
    notice: <SayoPausedNotice reason='paused' tone='dark' message='今月の会話の上限に達したため、サヨはお休み中です。' resumeAt='2026-12-01T00:00:00+09:00' />,
  },
};

/** 異常系：候補ボタンが多い（横スクロール） */
export const ManyChips: Story = {
  args: { chips: [...chips, '雨の日に観たい', '週末に一気見', '家族で観たい', '短編がいい', '音楽が良い作品', '頭を使う作品'] },
};

/** 異常系：候補ボタンなし */
export const NoChips: Story = { args: { chips: [] } };
