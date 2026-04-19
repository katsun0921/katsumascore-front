import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostCardSkeleton } from './PostCardSkeleton';

const meta = {
  title: 'ui-parts/PostCardSkeleton',
  component: PostCardSkeleton,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PostCardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
