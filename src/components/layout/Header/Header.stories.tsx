import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** デフォルト（ja） — toolbar の Locale で ja/en を切り替え可能 */
export const Default: Story = {};

/** 英語表示を固定確認したい場合は globals で locale を上書き */
export const English: Story = {
  globals: {
    locale: 'en',
  },
};
