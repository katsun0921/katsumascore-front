import type { Meta, StoryObj } from '@storybook/react-vite';
import { SeoHead } from './SeoHead';
import { mockPost, mockPostLongTitle, mockPostNoImage } from '@/mocks/post';

/**
 * PostSEO renders into <head> — visible output is via Storybook's addon panel (Head tags).
 * Stories here document valid prop combinations for SEO coverage.
 */
const meta: Meta<typeof SeoHead> = {
  title: 'Features/Post/PostSEO',
  component: SeoHead,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof SeoHead>;

export const Default: Story = {
  args: { post: mockPost },
};

export const Japanese: Story = {
  args: { post: mockPost, locale: 'ja' },
};

export const English: Story = {
  args: { post: mockPost, locale: 'en' },
};

export const LongTitle: Story = {
  args: { post: mockPostLongTitle },
};

export const NoImage: Story = {
  args: { post: mockPostNoImage },
};
