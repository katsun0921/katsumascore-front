import type { Meta, StoryObj } from '@storybook/react-vite'
import { ListFilterBar } from './ListFilterBar'

const meta: Meta<typeof ListFilterBar> = {
  title: 'features/Post/ListFilterBar',
  component: ListFilterBar,
  parameters: { layout: 'padded' },
  args: {
    options: [
      { label: 'すべて', value: 'all' },
      { label: '映画', value: 'movie' },
      { label: 'アニメ', value: 'anime' },
      { label: 'ドラマ', value: 'drama' },
    ],
    activeValue: 'all',
    onSelect: () => {},
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ActiveMiddle: Story = {
  args: { activeValue: 'anime' },
}

export const SingleOption: Story = {
  args: {
    options: [{ label: 'すべて', value: 'all' }],
    activeValue: 'all',
  },
}

export const ManyOptions: Story = {
  args: {
    options: [
      { label: 'すべて', value: 'all' },
      { label: '映画', value: 'movie' },
      { label: 'アニメ', value: 'anime' },
      { label: 'ドラマ', value: 'drama' },
      { label: 'バラエティ', value: 'variety' },
      { label: 'ドキュメンタリー', value: 'documentary' },
      { label: 'スポーツ', value: 'sports' },
    ],
    activeValue: 'all',
  },
}

export const LongLabel: Story = {
  args: {
    options: [
      { label: 'すべてのカテゴリーを表示する', value: 'all' },
      { label: '映画（劇場公開作品）', value: 'movie' },
    ],
    activeValue: 'all',
  },
}
