import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PostOverlay } from './PostOverlay';

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
    post: {
      id: 1,
      title: 'ジュピター[映画マトリックスのウォシャウスキー姉弟監督が手がけるSF大作]',
      excerpt: '',
      thumbnail: '/images/dummy-540X400.webp',
      score: '4',
      publishedAt: '2026-04-01',
      href: '#',
    },
  },
};
