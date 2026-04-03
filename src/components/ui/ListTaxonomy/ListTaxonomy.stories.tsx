import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListTaxonomy } from './ListTaxonomy';

const meta: Meta<typeof ListTaxonomy> = {
  title: 'UI/ListTaxonomy',
  component: ListTaxonomy,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'CATEGORIES',
    lists: [
      { name: '映画', link: '#', count: 18 },
      { name: 'アニメ', link: '#', count: 8 },
      { name: 'ドラマ', link: '#', count: 1 },
    ],
  },
};
