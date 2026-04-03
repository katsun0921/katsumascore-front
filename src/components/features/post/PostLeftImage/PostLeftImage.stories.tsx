import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PostLeftImage } from './PostLeftImage';
import { postCardMock } from '@/components/features/post/PostCard/PostCard.mock';

const meta: Meta<typeof PostLeftImage> = {
  title: 'Project/Post',
  component: PostLeftImage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ProjectPostLeftImage: Story = {
  args: {
    post: postCardMock,
  },
};
