import type { Meta, StoryObj } from '@storybook/react-vite';
import { POST_TYPE_ARCHIVE_NAV_ITEMS } from '@/config/wpContent.config';
import { ListFilterBar } from './ListFilterBar';

const postTypeFilterOptionsJa = POST_TYPE_ARCHIVE_NAV_ITEMS.map((item) => ({
  label: item.label.ja,
  value: item.postType,
}));

const meta: Meta<typeof ListFilterBar> = {
  title: 'features/Post/ListFilterBar',
  component: ListFilterBar,
  parameters: { layout: 'padded' },
  args: {
    options: [{ label: 'すべて', value: 'all' }, ...postTypeFilterOptionsJa],
    activeValue: 'all',
    onSelect: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof meta>

export const Default: Story = {};

export const ActiveMiddle: Story = {
  args: { activeValue: 'anime' },
};

export const SingleOption: Story = {
  args: {
    options: [{ label: 'すべて', value: 'all' }],
    activeValue: 'all',
  },
};

export const ManyOptions: Story = {
  args: {
    options: [
      { label: 'すべて', value: 'all' },
      ...postTypeFilterOptionsJa,
      { label: 'バラエティ', value: 'variety' },
      { label: 'ドキュメンタリー', value: 'documentary' },
      { label: 'スポーツ', value: 'sports' },
    ],
    activeValue: 'all',
  },
};

export const LongLabel: Story = {
  args: {
    options: [
      { label: 'すべてのジャンルを表示する', value: 'all' },
      { label: '映画（劇場公開作品）', value: 'movie' },
    ],
    activeValue: 'all',
  },
};
