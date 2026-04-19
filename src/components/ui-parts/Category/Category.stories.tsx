import type { Meta, StoryObj } from '@storybook/react-vite';

import { Category } from './Category';

const meta: Meta<typeof Category> = {
  title: 'ui/Category',
  component: Category,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: '映画',
  },
};

export const Small: Story = {
  args: {
    label: '映画',
    size: 'small',
  },
};
