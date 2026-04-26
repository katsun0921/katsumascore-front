import type { Meta, StoryObj } from '@storybook/react-vite'
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

export const Large: Story = { args: { size: 'lg' } }
export const Full: Story = { args: { size: 'full' } }
