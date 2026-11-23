import type { Meta, StoryObj } from '@storybook/react-vite';
import { DevToolsBox } from './DevToolsBox';

/**
 * 開発者ツールの箱。開発サーバー（Storybook の dev）でだけ出る。本番ビルドの Storybook では何も描かない
 */
const meta = {
  title: 'Features/DevTools/DevToolsBox',
  component: DevToolsBox,
  parameters: { layout: 'fullscreen', chromatic: { disable: true } },
} satisfies Meta<typeof DevToolsBox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 左下の「DEV」から開く */
export const Default: Story = {};

/** 最初から開いた状態（パネルの並び・切り替えの確認） */
export const Open: Story = { args: { defaultOpen: true } };
