import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProjectOverview } from './ProjectOverview'
import { messages } from './i18n'

const meta = {
  title: 'Docs/Overview',
  component: ProjectOverview,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        component: messages.meta.docsDescription.ja,
      },
    },
  },
} satisfies Meta<typeof ProjectOverview>

export default meta

type Story = StoryObj<typeof meta>

export const Page: Story = {
  render: () => <ProjectOverview />,
}
