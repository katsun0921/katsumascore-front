import type { Meta, StoryObj } from '@storybook/react-vite';
import { devToolsStore } from '@/libs/devtools';
import { SAYO_DEV_KEYS } from '@/components/features/sayo/mocks/sayoMockScenarios';
import { SayoDevPanel } from './SayoDevPanel';

/**
 * サヨ用パネル。値を変えるとページを再読み込みするので、Storybook 上では選ぶと表示が戻る。
 * 設定の保存・読み込みの動きは tests/unit/devtools.test.ts で確かめる
 */
const meta = {
  title: 'Features/DevTools/SayoDevPanel',
  component: SayoDevPanel,
  parameters: { layout: 'padded', chromatic: { disable: true } },
  decorators: [
    (Story) => (
      <div className='max-w-sm bg-[var(--color-bg-dark)] p-4 text-[color:var(--color-sayo-stage-text)]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SayoDevPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 既定：UI確認（mock）。通信せず、料金がかからない */
export const Default: Story = {
  loaders: [() => { devToolsStore.reset(Object.values(SAYO_DEV_KEYS)); }],
};

/** API疎通確認を保存済みの状態：赤い表示で「実際に送る・料金がかかる」と伝える。localhost では届かない旨の警告も出る */
export const ApiSelected: Story = {
  loaders: [() => { devToolsStore.set(SAYO_DEV_KEYS.dataSource, 'api'); }],
};
