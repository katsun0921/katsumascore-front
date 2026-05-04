import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchBox } from './SearchBox';

const meta: Meta<typeof SearchBox> = {
  title: 'Features/SearchBox',
  component: SearchBox,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof SearchBox>

export const Default: Story = {};

export const EnglishLocale: Story = {
  globals: { locale: 'en' },
};
