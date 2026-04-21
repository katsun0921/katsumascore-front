import type { Meta, StoryObj } from '@storybook/react-vite'

const HtmlProposal = ({ src }: { src: string }) => (
  <iframe
    src={src}
    style={{ width: '100%', height: '100vh', border: 'none' }}
    title={src}
  />
)

const meta: Meta<typeof HtmlProposal> = {
  title: 'ui-proposals/Hero',
  component: HtmlProposal,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof HtmlProposal>

export const HeroUnifiedFinal: Story = {
  args: { src: '/ui-proposals/hero_unified_final.html' },
}

export const Hero: Story = {
  args: { src: '/ui-proposals/hero.html' },
}

export const HeroV2: Story = {
  args: { src: '/ui-proposals/hero_v2.html' },
}

export const HeroV3: Story = {
  args: { src: '/ui-proposals/hero_v3.html' },
}
