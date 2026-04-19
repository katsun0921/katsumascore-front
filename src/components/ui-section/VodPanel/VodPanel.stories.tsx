import type { Meta, StoryObj } from '@storybook/react-vite'
import { VodPanel } from './VodPanel'

const meta: Meta<typeof VodPanel> = {
  title: 'ui-section/VodPanel',
  component: VodPanel,
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof meta>

const mockItems = [
  <div key='1' style={{ padding: '8px', background: 'var(--color-bg-muted)', borderRadius: '6px', textAlign: 'center' }}>Netflix</div>,
  <div key='2' style={{ padding: '8px', background: 'var(--color-bg-muted)', borderRadius: '6px', textAlign: 'center' }}>Prime Video</div>,
  <div key='3' style={{ padding: '8px', background: 'var(--color-bg-muted)', borderRadius: '6px', textAlign: 'center' }}>U-NEXT</div>,
]

export const List: Story = {
  args: {
    variant: 'list',
    heading: '配信サービスで観る',
    items: mockItems,
  },
}

export const ListNoHeading: Story = {
  args: {
    variant: 'list',
    items: mockItems,
  },
}

export const Cinema: Story = {
  args: {
    variant: 'cinema',
    badgeLabel: '劇場公開中',
    note: 'VOD配信はまだ開始されていません。現在劇場で公開中です。',
  },
}

export const CinemaLongNote: Story = {
  args: {
    variant: 'cinema',
    badgeLabel: '上映中',
    note: '現在全国の劇場で上映中のため、VOD配信は開始されていません。IMAX・4DX・ドルビーシネマなど各種上映形式で上映していますので、ぜひ劇場でご覧ください。',
  },
}
