import type { Meta, StoryObj } from '@storybook/react-vite';
import { SayoConsentTerms } from './SayoConsentTerms';

/** サヨの利用規約の本文（<details> で折りたたみ）。同意画面（SayoConsentModal）の中で使う */
const meta = {
  title: 'UI-Section/Sayo/SayoConsentTerms',
  component: SayoConsentTerms,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className='max-w-xl bg-[var(--color-sayo-paper)] p-4'><Story /></div>],
} satisfies Meta<typeof SayoConsentTerms>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 閉じた状態（既定） */
export const Closed: Story = {};

/** 「利用規約を読む」を開いた状態 */
export const Open: Story = { args: { defaultOpen: true } };

/** 英語（/en では出さないが、文言の漏れを確かめる） */
export const English: Story = { args: { defaultOpen: true }, globals: { locale: 'en' } };
