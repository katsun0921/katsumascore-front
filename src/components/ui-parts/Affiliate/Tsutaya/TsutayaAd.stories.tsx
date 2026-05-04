import type { Meta, StoryObj } from '@storybook/react-vite';
import { TsutayaAd } from './TsutayaAd';

const meta: Meta<typeof TsutayaAd> = {
  title: 'Ui-Parts/Affiliate/TsutayaAd',
  component: TsutayaAd,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof meta>

export const Default: Story = {};
