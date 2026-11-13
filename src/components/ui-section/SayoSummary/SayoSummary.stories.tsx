import type { Meta, StoryObj } from '@storybook/react-vite';
import { sayoMockSummary } from '@/mocks/sayo';
import { SayoSummary } from './SayoSummary';

const meta = {
  title: 'UI-Section/Sayo/SayoSummary',
  component: SayoSummary,
  parameters: { layout: 'padded' },
  args: { summary: sayoMockSummary(1203) },
  decorators: [
    (Story) => (
      <div className='max-w-xl bg-[var(--color-sayo-paper)] p-4'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SayoSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 異常系：要約が300字・タイトルが長い */
export const LongText: Story = {
  args: {
    summary: {
      ...sayoMockSummary(1201),
      lead: '『劇場版 機動戦士ガンダム ジークアクス 〜はじまりの地球と、終わらない夏の記憶〜 特別編集版』は、こんな作品です。',
      summary: `${sayoMockSummary(1201).summary}${sayoMockSummary(1202).summary}`.slice(0, 300),
    },
  },
};

/** 異常系：気分タグ0個・こんな方にが空 */
export const MixedData: Story = {
  args: { summary: { ...sayoMockSummary(1205), moodTags: [], recommendFor: '' } },
};
