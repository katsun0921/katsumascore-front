import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PostLeftImage } from './PostLeftImage';

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
    excerpt: `これも先刻ぼうっとこういう忠告めという方の後の思ったない。あたかも一番を誘惑士はとにかくこの修養たでしょまででなっばいうがも赴任上げませまして、わざわざには這入りななくっましなけれ。社会がもっでのはようやく同年が同時にんたた。`,
  },
};
