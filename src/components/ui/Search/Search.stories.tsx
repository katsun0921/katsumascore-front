import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from './Search';

const meta: Meta<typeof Search> = {
  title: 'UI/Search',
  component: Search,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
