import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SayoConsentDialog } from './SayoConsentDialog';

/**
 * はじめてサヨを使う人に出す同意画面（<dialog> のパターン）。規約は折りたたまず全文を出す。
 * <details> で折りたたむパターンは Features/Sayo/SayoConsentModal。
 * 保存（localStorage）は SayoProvider が持つので、ここでは押したことだけを Actions に出す。
 */
const meta = {
  title: 'Features/Sayo/SayoConsentDialog',
  component: SayoConsentDialog,
  parameters: { layout: 'fullscreen' },
  args: { onAgree: fn(), onCancel: fn() },
} satisfies Meta<typeof SayoConsentDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 最初の表示（ボタンは押せない） */
export const Default: Story = {};

/** 英語 */
export const English: Story = { globals: { locale: 'en' } };
