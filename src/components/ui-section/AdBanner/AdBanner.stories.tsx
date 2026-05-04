import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdBanner } from './AdBanner';

const meta: Meta<typeof AdBanner> = {
  title: 'Ui-Section/AdBanner',
  component: AdBanner,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>

export const Default: Story = {};

export const Inline: Story = {
  args: {
    inline: true,
  },
};
