import type { Meta, StoryObj } from '@storybook/react-vite';
import { HamburgerMenu } from './HamburgerMenu';

const meta: Meta<typeof HamburgerMenu> = {
  title: 'Features/Navigation/HamburgerMenu',
  component: HamburgerMenu,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'MENU',
  },
};
