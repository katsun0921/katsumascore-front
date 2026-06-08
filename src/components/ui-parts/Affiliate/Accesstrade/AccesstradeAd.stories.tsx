import type { Meta, StoryObj } from '@storybook/react-vite';
import { HuluBanner, WowowRectangleBanner, WowowSquareBanner } from './AccesstradeAd';

const meta: Meta = {
  title: 'Ui-Parts/Affiliate/Accesstrade',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Hulu: Story = { render: () => <HuluBanner /> };
export const WowowRectangle: Story = { render: () => <WowowRectangleBanner /> };
export const WowowSquare: Story = { render: () => <WowowSquareBanner /> };
