import type { Meta, StoryObj } from '@storybook/react-vite';
import { RatingBadge } from './RatingBadge';

const meta: Meta<typeof RatingBadge> = {
  title: 'Ui-Parts/RatingBadge',
  component: RatingBadge,
  tags: ['autodocs'],
  args: { rating: 'pg12' },
};
export default meta;

type Story = StoryObj<typeof RatingBadge>

export const G: Story = { args: { rating: 'g' } };
export const Pg12: Story = { args: { rating: 'pg12' } };
export const R15: Story = { args: { rating: 'r15' } };
export const R18: Story = { args: { rating: 'r18' } };
export const WithNote: Story = { args: { rating: 'r15', withNote: true } };
export const English: Story = { args: { rating: 'pg12', withNote: true }, globals: { locale: 'en' } };
