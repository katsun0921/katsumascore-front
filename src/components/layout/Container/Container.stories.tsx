import type { Meta, StoryObj } from '@storybook/react'
import { Container } from './Container'

const meta: Meta<typeof Container> = {
  title: 'layout/Container',
  component: Container,
  tags: ['autodocs'],
  args: {
    children: (
      <div style={{ background: '#e0e7ff', padding: '24px', textAlign: 'center' }}>
        Container content
      </div>
    ),
    size: 'lg',
  },
}
export default meta

type Story = StoryObj<typeof Container>

export const Small: Story = { args: { size: 'sm' } }
export const Medium: Story = { args: { size: 'md' } }
export const Large: Story = { args: { size: 'lg' } }
export const Full: Story = { args: { size: 'full' } }
