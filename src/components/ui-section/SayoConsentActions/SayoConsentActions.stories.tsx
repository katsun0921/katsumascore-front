import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SayoConsentActions } from './SayoConsentActions';

/** 同意画面の下部（チェックボックスとボタン）。印の状態は props で受け取る */
const meta = {
  title: 'UI-Section/Sayo/SayoConsentActions',
  component: SayoConsentActions,
  parameters: { layout: 'padded' },
  args: { checked: false, onCheckedChange: fn(), onAgree: fn(), onCancel: fn() },
  decorators: [(Story) => <div className='max-w-xl bg-[var(--color-sayo-paper)] p-4'><Story /></div>],
} satisfies Meta<typeof SayoConsentActions>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 未チェック：「同意して始める」は押せない */
export const Unchecked: Story = {};

/** チェック済み：押せる */
export const Checked: Story = { args: { checked: true } };

export const English: Story = { globals: { locale: 'en' } };
