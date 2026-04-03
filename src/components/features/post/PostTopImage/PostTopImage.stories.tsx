import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PostTopImage } from './PostTopImage';
import { postCardMock } from '@/components/features/post/PostCard/PostCard.mock';

const meta: Meta<typeof PostTopImage> = {
  title: 'Project/Post',
  component: PostTopImage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ProjectPostTopImage: Story = {
  args: {
    post: postCardMock,
  },
};
