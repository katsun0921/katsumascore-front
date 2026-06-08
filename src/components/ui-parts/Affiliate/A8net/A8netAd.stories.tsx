import type { Meta, StoryObj } from '@storybook/react-vite';
import { GeoAd, TsutayaAd } from './A8netAd';

const meta: Meta = {
  title: 'Ui-Parts/Affiliate/A8net',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Geo: Story = { render: () => <GeoAd /> };
export const Tsutaya: Story = { render: () => <TsutayaAd /> };
