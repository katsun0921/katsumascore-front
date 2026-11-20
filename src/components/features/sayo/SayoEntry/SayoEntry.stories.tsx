import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo } from 'react';
import { SayoProvider } from '@/components/features/sayo/SayoProvider';
import { createSayoMockClient } from '@/components/features/sayo/mocks/sayoMockClient';
import type { SayoMockOptions } from '@/components/features/sayo/mocks/sayoMockClient';
import { sayoMockChips } from '@/mocks/sayo';
import { SayoEntry } from './SayoEntry';

const Frame = ({ options, category }: { options?: SayoMockOptions; category?: string }) => {
  const client = useMemo(() => createSayoMockClient(options), [options]);
  return (
    <SayoProvider client={client} chips={sayoMockChips.map((c) => c.label)} category={category} initialRemaining={options?.remaining}>
      <div className='bg-[var(--color-bg-dark)] p-4'>
        <SayoEntry />
      </div>
    </SayoProvider>
  );
};

const meta = {
  title: 'Features/Sayo/SayoEntry',
  component: Frame,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Frame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {};

export const List: Story = { args: { category: '映画' } };

export const Paused: Story = { args: { options: { status: { paused: true } } } };

export const LimitReached: Story = { args: { options: { remaining: 0 } } };

/** 表示フラグ OFF：何も描かない */
export const Hidden: Story = { args: { options: { status: { visible: false } } } };
