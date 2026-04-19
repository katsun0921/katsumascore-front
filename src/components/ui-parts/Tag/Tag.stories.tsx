import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tags } from './Tag';

export default {
  title: 'Ui-Parts/Tag',
  component: Tags,
  argTypes: {},
} satisfies Meta<typeof Tags>;

type Story = StoryObj<typeof Tags>;

const Template: Story['render'] = (args) => <Tags {...args} />;

export const PrimaryTags: Story = {
  render: Template,
  args: {
    labels: ['Tag', 'Tag2'],
  },
};
