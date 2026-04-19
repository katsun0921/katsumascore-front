import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchResultItem } from './SearchResultItem'

const meta: Meta<typeof SearchResultItem> = {
  title: 'ui-parts/SearchResultItem',
  component: SearchResultItem,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <ul role='listbox'><Story /></ul>],
  args: {
    result: {
      id: 1,
      title: 'インターステラー',
      href: '/posts/interstellar',
      type: '映画',
    },
    isActive: false,
    id: 'item-0',
    onClick: () => {},
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Active: Story = {
  args: { isActive: true },
}

export const LongTitle: Story = {
  args: {
    result: {
      id: 2,
      title: 'ハリー・ポッターと死の秘宝 PART2 〜最終決戦と永遠の絆〜（完全版・4K HDR）',
      href: '/posts/harry-potter',
      type: '映画',
    },
  },
}

export const ActiveLongTitle: Story = {
  args: {
    result: {
      id: 3,
      title: 'ハリー・ポッターと死の秘宝 PART2 〜最終決戦と永遠の絆〜（完全版・4K HDR）',
      href: '/posts/harry-potter',
      type: '映画',
    },
    isActive: true,
  },
}
