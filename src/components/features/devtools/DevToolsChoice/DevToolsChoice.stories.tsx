import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DevToolsChoice } from './DevToolsChoice';

const options = [
  { value: 'a', label: 'A案（現行）', description: '現在の画面。' },
  { value: 'b', label: 'B案', description: '見出しを大きくした案。' },
  { value: 'c', label: 'C案', description: 'まだ作っていない案。', disabled: true, disabledReason: '未実装のため選べません' },
] as const;

const Frame = ({ display }: { display?: 'radio' | 'select' }) => {
  const [value, setValue] = useState<'a' | 'b' | 'c'>('a');
  return (
    <div className='max-w-xs bg-[var(--color-bg-dark)] p-4 text-[color:var(--color-sayo-stage-text)]'>
      <DevToolsChoice legend='画面の案' name='story' value={value} options={options} onChange={setValue} display={display} />
    </div>
  );
};

const meta = {
  title: 'Features/DevTools/DevToolsChoice',
  component: Frame,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Frame>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ラジオボタン（選択肢が少ないとき）。選べない選択肢は理由を出す */
export const Radio: Story = {};

/** プルダウン（選択肢が多いとき） */
export const Select: Story = { args: { display: 'select' } };
