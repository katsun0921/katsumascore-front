import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotFoundTemplate } from './NotFoundTemplate';

const meta: Meta<typeof NotFoundTemplate> = {
  title: 'Templates/NotFoundTemplate',
  component: NotFoundTemplate,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
