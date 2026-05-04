import type { Meta, StoryObj } from '@storybook/react-vite';
import { AboutTemplate } from './AboutTemplate';

const meta: Meta<typeof AboutTemplate> = {
  title: 'Templates/AboutTemplate',
  component: AboutTemplate,
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
