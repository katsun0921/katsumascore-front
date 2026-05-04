import type { Meta, StoryObj } from '@storybook/react-vite';
import { VodMenuItem } from './VodMenuItem';

const meta: Meta<typeof VodMenuItem> = {
  title: 'Ui-Parts/VodMenuItem',
  component: VodMenuItem,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <ul style={{ width: '240px', listStyle: 'none', padding: 0, margin: 0 }}><Story /></ul>],
  args: {
    item: {
      service: 'netflix',
      label: 'Netflix',
      status: true,
      href: 'https://netflix.com',
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>

export const Available: Story = {};

export const Unavailable: Story = {
  args: {
    item: {
      service: 'unext',
      label: 'U-NEXT',
      status: false,
      href: 'https://unext.jp',
    },
  },
};

export const LongLabel: Story = {
  args: {
    item: {
      service: 'amazon',
      label: 'Amazon Prime Video（プライム会員限定）',
      status: true,
      href: 'https://amazon.co.jp/prime-video',
    },
  },
};
