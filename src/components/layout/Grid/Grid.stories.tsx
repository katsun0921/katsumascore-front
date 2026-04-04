import type { Meta, StoryObj } from '@storybook/react'
import { Grid } from './Grid'

const Item = ({ label }: { label: string }) => (
  <div style={{ background: '#e0e7ff', padding: '20px', borderRadius: '6px', textAlign: 'center' }}>
    {label}
  </div>
)

const items = Array.from({ length: 6 }, (_, i) => <Item key={i} label={`Item ${i + 1}`} />)

const meta: Meta<typeof Grid> = {
  title: 'layout/Grid',
  component: Grid,
  tags: ['autodocs'],
  args: { children: items, gap: 'md' },
}
export default meta

type Story = StoryObj<typeof Grid>

export const OneColumn: Story = { args: { cols: 1 } }
export const TwoColumns: Story = { args: { cols: 2 } }
export const ThreeColumns: Story = { args: { cols: 3 } }
export const Responsive: Story = { args: { cols: 1, colsMd: 2, colsLg: 3 } }
export const GapLarge: Story = { args: { cols: 3, gap: 'lg' } }
