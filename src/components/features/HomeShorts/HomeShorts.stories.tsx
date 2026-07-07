import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockShortVideoPosts } from '@/components/ui-home/mocks/home';
import { HomeShorts } from './HomeShorts';

const meta: Meta<typeof HomeShorts> = {
  title: 'Features/HomeShorts',
  component: HomeShorts,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'ショート動画で紹介',
    posts: mockShortVideoPosts,
  },
};

export const SingleItem: Story = {
  args: {
    title: 'ショート動画で紹介',
    posts: mockShortVideoPosts.slice(0, 1),
  },
};

export const NoImage: Story = {
  args: {
    title: 'ショート動画で紹介',
    posts: mockShortVideoPosts.map((p) => ({ ...p, image: null })),
  },
};

/** ショート動画が 1 件も無いときはセクションごと非表示になる */
export const Empty: Story = {
  args: {
    title: 'ショート動画で紹介',
    posts: mockShortVideoPosts.map(({ shortVideoId, ...rest }) => {
      void shortVideoId;
      return rest;
    }),
  },
};

export const English: Story = {
  globals: { locale: 'en' },
  args: {
    title: 'Intro Shorts',
    posts: mockShortVideoPosts,
  },
};
