import type { Meta, StoryObj } from '@storybook/react-vite';
import { StreamingVod } from './StreamingVod';

const mockServices = [
  { service: 'netflix' as const, url: 'https://netflix.com/watch/123', signupUrl: 'https://netflix.com/signup' },
  { service: 'prime-video' as const, url: 'https://amazon.co.jp/watch/123', signupUrl: 'https://amazon.co.jp/prime' },
  { service: 'unext' as const, url: 'https://unext.jp/watch/123', isPaid: true },
];

const meta: Meta<typeof StreamingVod> = {
  title: 'features/StreamingVod',
  component: StreamingVod,
  tags: ['autodocs'],
  args: {
    title: '鬼滅の刃',
    services: mockServices,
  },
};
export default meta;

type Story = StoryObj<typeof StreamingVod>

export const Japanese: Story = {};
export const English: Story = {
  args: { title: 'Demon Slayer' },
  globals: { locale: 'en' },
};
export const SingleService: Story = { args: { services: [mockServices[0]] } };
export const AllServices: Story = {
  args: {
    services: [
      ...mockServices,
      { service: 'disney' as const, url: 'https://disneyplus.com/watch/123' },
      { service: 'dmmtv' as const, url: 'https://dmmtv.jp/watch/123' },
    ],
  },
};
