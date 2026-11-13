import type { Meta, StoryObj } from '@storybook/react-vite';
import { SayoNovelWindow } from './SayoNovelWindow';

const meta = {
  title: 'UI-Section/Sayo/SayoNovelWindow',
  component: SayoNovelWindow,
  parameters: { layout: 'padded' },
  args: {
    speaker: 'sayo',
    done: true,
    children: '似た空気の作品でしたら、記事のある中では『鋼鉄のパレード』が近いと思います。どちらも、音の使い方で気持ちを運ぶタイプの作品なんです。',
  },
  decorators: [
    (Story) => (
      <div className='max-w-3xl bg-[var(--color-sayo-stage)] px-4 pb-4 pt-8'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SayoNovelWindow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sayo: Story = {};

export const User: Story = { args: { speaker: 'user', done: false, children: '似た作品は？' } };

/** 考え中 */
export const Thinking: Story = { args: { done: false, children: '（棚の前で、少し考えています……）' } };

/** ネタバレ：表示する前 */
export const Spoiler: Story = { args: { spoiler: true, done: false, children: '結末に触れる返事です。' } };

/** 異常系：長い文（ウィンドウの中でスクロール） */
export const LongText: Story = {
  args: {
    children:
      '『提灯坂の怪談帖』ですね。……少しだけ、詳しくお話しします。\n坂の途中にある古本屋に、毎回いわくつきの本が持ち込まれる一話完結の怪談アニメです。記事では、背景美術の提灯の明かりが話ごとに色を変え、その回の怖さの種類を先に知らせている工夫を紹介しています。怖さは控えめで、後味が切ない回が多いとまとめられています。\n気になるところを選んでください。',
  },
};
