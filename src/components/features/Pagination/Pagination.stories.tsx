import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pagination } from './Pagination'

const meta: Meta<typeof Pagination> = {
  title: 'Features/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: () => {},
  },
}
export default meta

type Story = StoryObj<typeof Pagination>

export const FirstPage: Story = { args: { currentPage: 1 } }
export const MiddlePage: Story = { args: { currentPage: 5 } }
export const LastPage: Story = { args: { currentPage: 10 } }
export const FewPages: Story = { args: { currentPage: 2, totalPages: 3 } }
