import type { Meta, StoryObj } from '@storybook/react-vite'
import { Typography } from './Typography'

const meta = {
  title: 'Styles/Typography',
  component: Typography,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  args: {
    variant: 'overview',
  },
}

export const ColorPalette: Story = {
  args: {
    variant: 'palette',
  },
}

export const FontFamilies: Story = {
  args: {
    variant: 'fonts',
  },
}
