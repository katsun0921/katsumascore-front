import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PostTopImage } from './PostTopImage';

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
    post: {
      id: 1,
      title: '夏目漱石「私の個人主義」',
      excerpt:
        'これも先刻ぼうっとこういう忠告めという方の後の思ったない。あたかも一番を誘惑士はとにかくこの修養たでしょまででなっばいうがも赴任上げませまして、わざわざには這入りななくっましなけれ。社会がもっでのはようやく同年が同時にんたた。',
      thumbnail: '/images/dummy-540X400.webp',
      score: '4',
      publishedAt: '2026-04-01',
      href: '#',
    },
  },
};
