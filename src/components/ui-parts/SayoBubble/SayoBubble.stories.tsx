import type { Meta, StoryObj } from '@storybook/react-vite';
import { SayoBubble } from './SayoBubble';

const meta = {
  title: 'UI-Parts/Sayo/SayoBubble',
  component: SayoBubble,
  parameters: { layout: 'padded' },
  args: { children: '怖すぎないホラーでしたら、こちらはいかがでしょう。大きな音で驚かせるより、空気でじわじわ来るタイプです。' },
  decorators: [
    (Story) => (
      <div className='max-w-xl bg-[var(--color-sayo-paper)] p-4'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SayoBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sayo: Story = {};

export const User: Story = { args: { speaker: 'user', children: '怖すぎないホラー' } };

/** 異常系：300字の要約（承認済み要約の上限） */
export const LongText: Story = {
  args: {
    children:
      '孤島の灯台を一人で守る男が、毎晩少しずつ濃くなる霧と、霧の向こうから届く信号に悩まされる物語です。記事では、波の音が途切れる瞬間の「無音」の使い方を高く評価していて、驚かせる場面はほとんどないのに、画面の暗がりを自分から探してしまう怖さがあると書かれています。灯台の光が届く範囲と届かない範囲を、カメラが行き来する撮り方も見どころとして挙げられています。後半は信号の正体に迫りますが、答えをはっきり示さない終わり方は好みが分かれるかもしれない、ともまとめられています。',
  },
};
