import type { Meta, StoryObj } from '@storybook/react-vite'
import { StreamingVod } from './StreamingVod'

const meta: Meta<typeof StreamingVod> = {
  title: 'ui-section/StreamingVod',
  component: StreamingVod,
  parameters: { layout: 'padded' },
  args: {
    heading: '配信サービスで観る',
    items: [
      <div key='1' style={{ padding: '8px', background: 'var(--color-bg-muted)', borderRadius: '6px', textAlign: 'center' }}>Netflix</div>,
      <div key='2' style={{ padding: '8px', background: 'var(--color-bg-muted)', borderRadius: '6px', textAlign: 'center' }}>Prime Video</div>,
      <div key='3' style={{ padding: '8px', background: 'var(--color-bg-muted)', borderRadius: '6px', textAlign: 'center' }}>U-NEXT</div>,
    ],
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SingleItem: Story = {
  args: {
    items: [
      <div key='1' style={{ padding: '8px', background: 'var(--color-bg-muted)', borderRadius: '6px', textAlign: 'center' }}>Netflix</div>,
    ],
  },
}

export const ManyItems: Story = {
  args: {
    items: Array.from({ length: 6 }, (_, i) => (
      <div key={i} style={{ padding: '8px', background: 'var(--color-bg-muted)', borderRadius: '6px', textAlign: 'center' }}>
        {['Netflix', 'Prime Video', 'U-NEXT', 'Hulu', 'Disney+', 'Apple TV+'][i]}
      </div>
    )),
  },
}
