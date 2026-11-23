import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo } from 'react';
import { SayoProvider } from '@/components/features/sayo/SayoProvider';
import { createSayoMockClient } from '@/components/features/sayo/mocks/sayoMockClient';
import { sayoMockChips } from '@/mocks/sayo';
import { SayoGate } from './SayoGate';

const Frame = ({ visible, fails = false }: { visible: boolean; fails?: boolean }) => {
  const client = useMemo(() => createSayoMockClient({ status: { visible }, statusFails: fails }), [visible, fails]);
  return (
    <SayoProvider client={client} chips={sayoMockChips.map((c) => c.label)}>
      <p>この下に、表示できるときだけ枠が出ます。</p>
      <SayoGate>
        <div className='mt-2 rounded-lg border border-[var(--color-sayo-amber)] p-4'>サヨを表示中</div>
      </SayoGate>
    </SayoProvider>
  );
};

const meta = {
  title: 'Features/Sayo/SayoGate',
  component: Frame,
  parameters: { layout: 'padded' },
  args: { visible: true },
} satisfies Meta<typeof Frame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visible: Story = {};

export const Hidden: Story = { args: { visible: false } };

export const StatusError: Story = { args: { fails: true } };
