import type { Meta, StoryObj } from '@storybook/react-vite';
import { VodPanel } from './VodPanel';

const mockServices = [
  { service: 'netflix' as const, url: 'https://netflix.com/watch/123', signupUrl: 'https://netflix.com/signup' },
  { service: 'amazon' as const, url: 'https://amazon.co.jp/watch/123', signupUrl: 'https://amazon.co.jp/prime' },
  { service: 'unext' as const, url: 'https://unext.jp/watch/123', isPaid: true },
];

const meta: Meta<typeof VodPanel> = {
  title: 'features/VodPanel',
  component: VodPanel,
  tags: ['autodocs'],
  args: {
    services: mockServices,
    isCinema: false,
    titleJp: '鬼滅の刃',
  },
};
export default meta;

type Story = StoryObj<typeof VodPanel>

export const Available: Story = {};
export const CinemaMode: Story = { args: { isCinema: true } };
export const English: Story = { globals: { locale: 'en' } };
export const Single: Story = { args: { services: [mockServices[0]] } };
