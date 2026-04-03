import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListSocialIcon } from './ListSocialIcon';

const meta: Meta<typeof ListSocialIcon> = {
  title: 'UI/ListSocialIcon',
  component: ListSocialIcon,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
