import type { Meta, StoryObj } from '@storybook/react-vite';
import { SayoFaceButton } from './SayoFaceButton';

const meta = {
  title: 'UI-Parts/Sayo/SayoFaceButton',
  component: SayoFaceButton,
  parameters: { layout: 'padded' },
  args: { label: '要約', ariaLabel: '『霧の灯台守』をサヨに要約してもらう', onClick: () => {} },
  decorators: [
    (Story) => (
      <div className='bg-[var(--color-bg-dark)] p-6'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SayoFaceButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** リストの先頭記事（文言を長く） */
export const Lead: Story = { args: { label: 'サヨに要約してもらう' } };

/** SPのグリッド（顔だけ） */
export const Compact: Story = { args: { compact: true } };

/** 異常系：想定より長い文言でも1行に収める */
export const LongLabel: Story = { args: { label: 'サヨに、この作品のことを詳しく要約してもらう' } };
