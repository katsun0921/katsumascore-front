import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostSEO } from './PostSEO';
import { mockPost, mockPostLongTitle, mockPostNoImage } from '@/components/features/post/mocks/post';

/**
 * PostSEO renders into <head> — visible output is via Storybook's addon panel (Head tags).
 * Stories here document valid prop combinations for SEO coverage.
 */
const meta: Meta<typeof PostSEO> = {
  title: 'Features/Post/PostSEO',
  component: PostSEO,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof PostSEO>;

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
