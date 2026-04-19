import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchModal } from './SearchModal'

const meta: Meta<typeof SearchModal> = {
  title: 'Ui-Parts/SearchModal',
  component: SearchModal,
  parameters: { layout: 'fullscreen' },
  args: {
    onClose: () => {},
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
