import type { Meta, StoryObj } from '@storybook/react-vite'
import { GeoAd } from './GeoAd'

const meta: Meta<typeof GeoAd> = {
  title: 'Ui-Parts/Affiliate/GeoAd',
  component: GeoAd,
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
