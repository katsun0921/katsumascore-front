import type { Meta, StoryObj } from '@storybook/react-vite';
import { Navigation } from './Navigation';

const meta: Meta<typeof Navigation> = {
  title: 'Layout/Navigation',
  component: Navigation,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const HeaderNavigationMenu: Story = {
  args: {},
};
