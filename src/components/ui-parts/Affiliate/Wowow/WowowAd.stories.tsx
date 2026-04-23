import type { Meta, StoryObj } from '@storybook/react-vite'
import { WowowSquareBanner } from './WowowAd'

const meta: Meta<typeof WowowSquareBanner> = {
  title: 'Ui-Parts/Affiliate/WowowSquareBanner',
  component: WowowSquareBanner,
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
