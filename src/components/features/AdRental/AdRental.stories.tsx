import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdRental } from './AdRental';

const meta: Meta<typeof AdRental> = {
  title: 'features/AdRental',
  component: AdRental,
  tags: ['autodocs'],
  args: {
    title: '鬼滅の刃',
  },
};
export default meta;

type Story = StoryObj<typeof AdRental>

export const BothServices: Story = {};
export const English: Story = { globals: { locale: 'en' } };
