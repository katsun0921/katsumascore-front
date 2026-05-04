import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContactTemplate } from './ContactTemplate';

const meta: Meta<typeof ContactTemplate> = {
  title: 'Templates/ContactTemplate',
  component: ContactTemplate,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const English: Story = {
  globals: { locale: 'en' },
};
