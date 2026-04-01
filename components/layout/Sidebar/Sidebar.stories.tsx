import type { Meta, StoryObj } from '@storybook/react-vite';

import { Sidebar } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const PageSidebar: Story = {
  args: {},
};
