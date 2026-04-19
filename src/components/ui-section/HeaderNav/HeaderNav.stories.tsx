import type { Meta, StoryObj } from '@storybook/react-vite'
import { HeaderNav } from './HeaderNav'

const meta: Meta<typeof HeaderNav> = {
  title: 'ui-section/HeaderNav',
  component: HeaderNav,
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof meta>

export const PC: Story = {
  args: { layout: 'pc' },
  decorators: [(Story) => <div style={{ background: 'var(--color-header)', padding: '12px 16px' }}><Story /></div>],
}

export const SP: Story = {
  args: { layout: 'sp' },
  decorators: [(Story) => <div style={{ background: 'var(--color-header)', width: '375px' }}><Story /></div>],
}
