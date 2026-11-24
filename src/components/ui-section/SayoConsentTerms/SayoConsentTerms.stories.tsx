import type { Meta, StoryObj } from '@storybook/react-vite';
import { SayoConsentTerms } from './SayoConsentTerms';

/** サヨの利用規約の項目。同意画面（SayoConsentModal の <details>／SayoConsentDialog の <dialog>）の中で使う */
const meta = {
  title: 'UI-Section/Sayo/SayoConsentTerms',
  component: SayoConsentTerms,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className='max-w-xl bg-[var(--color-sayo-paper)] p-4'><Story /></div>],
} satisfies Meta<typeof SayoConsentTerms>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 英語（/en では出さないが、文言の漏れを確かめる） */
export const English: Story = { globals: { locale: 'en' } };
