import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs } from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Features/Post/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  args: {
    title: '鬼滅の刃 柱稽古編',
    category: 'アニメ',
    type: 'anime',
    lang: 'ja',
  },
};
export default meta;

type Story = StoryObj<typeof Breadcrumbs>

export const Default: Story = {};

export const English: Story = {
  args: {
    title: 'Demon Slayer Hashira Training Arc',
    category: 'Anime',
    type: 'anime',
    lang: 'en',
  },
  globals: { locale: 'en' },
};

export const NoCategory: Story = {
  args: {
    category: undefined,
  },
};

export const LongTitle: Story = {
  args: {
    title: 'これはとても長い作品タイトルが入った場合でもパンくずリストが折り返しと省略を保ちながら表示できるかを確認するためのレビュー記事タイトル',
    category: '映画',
    type: 'movie',
  },
};
