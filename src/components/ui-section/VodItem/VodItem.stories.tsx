import type { Meta, StoryObj } from '@storybook/react-vite';
import { VodItem } from './VodItem';

const meta: Meta<typeof VodItem> = {
  title: 'UI-Section/VodItem',
  component: VodItem,
  tags: ['autodocs'],
  args: {
    streamingUrl: 'https://example.com/watch',
  },
};

export default meta;

type Story = StoryObj<typeof VodItem>

export const Subscription: Story = { args: { service: 'netflix', viewingType: 'subscription' } };
export const Rental: Story = { args: { service: 'prime-video', viewingType: 'rental' } };
export const NoViewingType: Story = { args: { service: 'unext' } };
export const Disney: Story = { args: { service: 'disney', viewingType: 'subscription' } };
export const Paid: Story = { args: { service: 'netflix', isPaid: true, viewingType: 'subscription' } };
export const English: Story = { args: { service: 'prime-video', viewingType: 'subscription' }, globals: { locale: 'en' } };
export const EnglishRental: Story = { args: { service: 'unext', viewingType: 'rental' }, globals: { locale: 'en' } };
