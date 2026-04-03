import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PostOverlay } from './PostOverlay';
import { postOverlayMock } from '@/components/features/post/PostCard/PostCard.mock';

const meta: Meta<typeof PostOverlay> = {
  title: 'Project/Post',
  component: PostOverlay,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ProjectPostImageOverlay: Story = {
  args: {
    post: postOverlayMock,
  },
};
