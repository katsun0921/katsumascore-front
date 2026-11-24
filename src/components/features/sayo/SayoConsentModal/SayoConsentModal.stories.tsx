import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SayoConsentModal } from './SayoConsentModal';

/**
 * はじめてサヨを使う人に出す同意画面（<details> のパターン）。チェックを入れたときだけ「同意して始める」を押せる。
 * <dialog> で作るパターンは Features/Sayo/SayoConsentDialog。
 * 保存（localStorage）は SayoProvider が持つので、ここでは押したことだけを Actions に出す。
 */
const meta = {
  title: 'Features/Sayo/SayoConsentModal',
  component: SayoConsentModal,
  parameters: { layout: 'fullscreen' },
  args: { onAgree: fn(), onCancel: fn() },
} satisfies Meta<typeof SayoConsentModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 最初の表示（規約は閉じ、ボタンは押せない） */
export const Default: Story = {};

/** 規約を開いた状態 */
export const TermsOpen: Story = { args: { defaultOpen: true } };

/** 英語 */
export const English: Story = { args: { defaultOpen: true }, globals: { locale: 'en' } };
