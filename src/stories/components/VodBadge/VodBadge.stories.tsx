import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { VodBadge } from './VodBadge';

const meta: Meta<typeof VodBadge> = {
  title: 'Components/VodBadge',
  component: VodBadge,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    netflix: { control: 'boolean' },
    amazon: { control: 'boolean' },
    unext: { control: 'boolean' },
    isCinema: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllAvailable: Story = {
  args: {
    netflix: true,
    amazon: true,
    unext: true,
  },
};

export const OnlyNetflix: Story = {
  args: {
    netflix: true,
  },
};

export const OnlyAmazon: Story = {
  args: {
    amazon: true,
  },
};

export const OnlyUnext: Story = {
  args: {
    unext: true,
  },
};

export const Cinema: Story = {
  args: {
    isCinema: true,
  },
};

export const NoneAvailable: Story = {
  args: {
    netflix: false,
    amazon: false,
    unext: false,
  },
};
