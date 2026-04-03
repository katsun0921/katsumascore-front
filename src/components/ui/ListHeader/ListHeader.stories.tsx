import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListHeader } from './ListHeader';

const meta: Meta<typeof ListHeader> = {
  title: 'UI/ListHeader',
  component: ListHeader,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
