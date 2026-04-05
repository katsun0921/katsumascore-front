import type { Meta, StoryObj } from '@storybook/react-vite';
import { VodLink } from './VodLink';

const meta: Meta<typeof VodLink> = {
  title: 'UI/VodLink',
  component: VodLink,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
