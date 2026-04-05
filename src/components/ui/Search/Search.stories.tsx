import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from './Search';

const meta: Meta<typeof Search> = {
  title: 'UI/Search',
  component: Search,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1e1b4b' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  args: {
    onNavigate: (href: string) => {
      console.log('navigate to:', href);
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Default empty state
export const Default: Story = {};

// Type "イ" to see autocomplete results
export const Typing: Story = {
  name: 'Typing（入力中）',
};

// Keyboard navigation: type "ゲーム" to see single result
export const SingleResult: Story = {
  name: 'SingleResult（1件）',
};

// Type anything not matching mock data to see empty state
export const Empty: Story = {
  name: 'Empty（0件）',
};

// Light background variant
export const OnLightBackground: Story = {
  name: 'OnLightBackground（白背景）',
  parameters: {
    backgrounds: { default: 'light' },
  },
};
