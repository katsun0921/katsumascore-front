import type { Meta, StoryObj } from '@storybook/react-vite';
import { VodMenu } from './VodMenu';
import type { TVodMenuService } from './VodMenu.types';

const mockServices: TVodMenuService[] = [
  { service: 'netflix', label: 'Netflix', status: true, href: '/vod/netflix' },
  { service: 'amazon', label: 'Amazon Prime', status: true, href: '/vod/amazon' },
  { service: 'unext', label: 'U-NEXT', status: false, href: '/vod/unext' },
];

const meta: Meta<typeof VodMenu> = {
  title: 'UI/VodMenu',
  component: VodMenu,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  args: {
    services: mockServices,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = {
  args: {
    defaultOpen: true,
  },
};

export const AllAvailable: Story = {
  args: {
    defaultOpen: true,
    services: mockServices.map((s) => ({ ...s, status: true })),
  },
};

export const AllUnavailable: Story = {
  args: {
    defaultOpen: true,
    services: mockServices.map((s) => ({ ...s, status: false })),
  },
};
