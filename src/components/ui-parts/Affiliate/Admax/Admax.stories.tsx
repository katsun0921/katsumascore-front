import type { Meta, StoryObj } from '@storybook/react-vite';
import { Admax } from './Admax';

const meta: Meta<typeof Admax> = {
  title: 'Ui-Parts/Affiliate/Admax',
  component: Admax,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof meta>

export const Default: Story = {};
