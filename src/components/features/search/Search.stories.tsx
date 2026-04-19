import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from './Search';

const WithNavigationBackground = (Story: React.ComponentType) => {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.sb-show-main')
    if (el) el.style.background = 'var(--color-navigation)'
    return () => {
      if (el) el.style.background = ''
    }
  }, [])
  return <Story />
}

const WithLightBackground = (Story: React.ComponentType) => {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.sb-show-main')
    if (el) el.style.background = 'var(--color-bg)'
    return () => {
      if (el) el.style.background = ''
    }
  }, [])
  return <Story />
}

const meta: Meta<typeof Search> = {
  title: 'Features/Search/Search',
  component: Search,
  decorators: [WithNavigationBackground],
  parameters: {
    layout: 'centered',
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
  decorators: [WithLightBackground],
};
