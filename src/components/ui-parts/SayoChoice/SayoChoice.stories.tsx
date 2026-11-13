import type { Meta, StoryObj } from '@storybook/react-vite';
import { SayoChoice } from './SayoChoice';

const meta = {
  title: 'UI-Parts/Sayo/SayoChoice',
  component: SayoChoice,
  parameters: { layout: 'padded' },
  args: { label: '似た作品は？', onClick: () => {} },
  decorators: [
    (Story) => (
      <div className='bg-[var(--color-sayo-stage)] p-6'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SayoChoice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };

export const Spoiler: Story = { args: { label: '結末を教えて（ネタバレ）' } };

/** 異常系：長い選択肢は折り返さず、横スクロールの列に任せる */
export const LongLabel: Story = { args: { label: '『劇場版 機動戦士ガンダム ジークアクス』の音響設計について、もう少し詳しく' } };
