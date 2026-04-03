import type { Meta, StoryObj } from '@storybook/react-vite'
import { DesignRules } from './DesignRules'

const meta = {
  title: 'Docs/Design Rules',
  component: DesignRules,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'KatsumaScore のデザインルールを Storybook 上で確認するための docs ページです。`docs/katsumascore_design_rules.md` と `src/styles/globals.css` の運用方針をまとめています。',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => <DesignRules />,
}
