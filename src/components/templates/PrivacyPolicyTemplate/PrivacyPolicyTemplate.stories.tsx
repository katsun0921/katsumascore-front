import type { Meta, StoryObj } from '@storybook/react-vite';
import { PrivacyPolicyTemplate } from './PrivacyPolicyTemplate';

const meta: Meta<typeof PrivacyPolicyTemplate> = {
  title: 'Templates/PrivacyPolicyTemplate',
  component: PrivacyPolicyTemplate,
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
