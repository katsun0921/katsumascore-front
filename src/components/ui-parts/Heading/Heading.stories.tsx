import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Heading } from './Heading';

export default {
  title: 'ui-parts/Heading',
  component: Heading,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    color: { control: 'color' },
  },
} satisfies Meta<typeof Heading>;

type HeadingProps = React.ComponentProps<typeof Heading>;
const Template = (args: HeadingProps) => (
  <div style={{ backgroundColor: args.color }}>
    <Heading {...args} />
  </div>
);

export const TitleHeading: StoryObj<typeof Heading> = {
  render: Template,
  args: {
    headingLevel: '1',
    type: 'title',
    color: 'var(--color-text-primary)',
    label: 'title の見出し',
    isLink: false,
  },
};

export const PostHeading: StoryObj<typeof Heading> = {
  render: Template,
  args: {
    headingLevel: '3',
    type: 'post',
    color: 'var(--color-bg)',
    isLink: true,
    label: 'title の見出し',
  },
};

export const PostRelatedHeading: StoryObj<typeof Heading> = {
  render: Template,
  args: {
    headingLevel: '3',
    type: 'related',
    color: 'var(--color-bg)',
    label: 'title の見出し',
    isLink: false,
  },
};

export const BgAccentHeading: StoryObj<typeof Heading> = {
  render: Template,
  args: {
    headingLevel: '2',
    type: 'bg-accent',
    color: 'var(--color-bg)',
    label: 'アクセント背景見出し',
    isLink: false,
  },
};

export const BgGradientHeading: StoryObj<typeof Heading> = {
  render: Template,
  args: {
    headingLevel: '2',
    type: 'bg-gradient',
    color: 'var(--color-bg)',
    label: 'グラデーション背景見出し',
    isLink: false,
  },
};

export const RibbonHeading: StoryObj<typeof Heading> = {
  render: Template,
  args: {
    headingLevel: '2',
    type: 'ribbon',
    color: 'var(--color-bg)',
    label: 'リボン風見出し',
    isLink: false,
  },
};

export const BgWrapHeading: StoryObj<typeof Heading> = {
  render: Template,
  args: {
    headingLevel: '2',
    type: 'bg-wrap',
    color: 'var(--color-bg)',
    label: '背景に回り込むイメージの見出し',
    isLink: false,
  },
};

export const QuoteHeading: StoryObj<typeof Heading> = {
  render: Template,
  args: {
    headingLevel: '2',
    type: 'quote',
    color: 'var(--color-bg)',
    label: 'カギ括弧を付けた見出し',
    isLink: false,
  },
};

export const GoldTextHeading: StoryObj<typeof Heading> = {
  render: Template,
  args: {
    headingLevel: '2',
    type: 'gold-text',
    color: 'var(--color-text-primary)',
    label: '文字ゴールドグラデーション',
    isLink: false,
  },
};

