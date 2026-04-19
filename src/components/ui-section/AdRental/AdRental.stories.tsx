import type { Meta, StoryObj } from '@storybook/react-vite'
import { AdRental } from './AdRental'

const meta: Meta<typeof AdRental> = {
  title: 'ui-section/AdRental',
  component: AdRental,
  parameters: { layout: 'padded' },
  args: {
    heading: 'レンタルで観る',
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LongHeading: Story = {
  args: { heading: 'TSUTAYAディスカスやゲオ宅配でレンタルして観る方法' },
}
