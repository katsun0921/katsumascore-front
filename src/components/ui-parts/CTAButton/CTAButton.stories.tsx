import type { Meta, StoryObj } from '@storybook/react-vite'
import { CTAButton } from './CTAButton'

const meta: Meta<typeof CTAButton> = {
  title: 'ui-parts/CTAButton',
  component: CTAButton,
  parameters: { layout: 'padded' },
  args: {
    href: '/vod',
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [(Story) => <div style={{ width: '320px' }}><Story /></div>],
}

export const English: Story = {
  globals: { locale: 'en' },
}
