import type { Meta, StoryObj } from '@storybook/react-vite';
import { SayoDeepButton } from './SayoDeepButton';

const meta = {
  title: 'UI-Parts/Sayo/SayoDeepButton',
  component: SayoDeepButton,
  parameters: { layout: 'padded' },
  args: {
    title: '『提灯坂の怪談帖』を詳しく知りたい',
    description: '見どころ・惜しいところ・似た作品・結末まで、サヨと話しながら聞けます（ここから先はAIとの会話です）',
    onClick: () => {},
  },
  decorators: [
    (Story) => (
      <div className='max-w-xl bg-[var(--color-sayo-paper)] p-4'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SayoDeepButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 探した結果のモーダル */
export const Search: Story = {
  args: { title: '詳しく知りたい', description: '選んだ作品の話を、サヨの映画店でゆっくり聞けます。ほかの気分で探し直すこともできます' },
};

/** 異常系：長い作品名 */
export const LongTitle: Story = {
  args: { title: '『劇場版 機動戦士ガンダム ジークアクス 〜はじまりの地球と、終わらない夏の記憶〜』を詳しく知りたい' },
};
