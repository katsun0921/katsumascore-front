import type { Meta, StoryObj } from '@storybook/react-vite';

/** サヨ会話UIのHTMLモック（src/ui-proposals/sayo-chat/）をStorybookで開くためのラッパー */
const HtmlProposal = ({ src }: { src: string }) => (
  <iframe
    src={src}
    style={{ width: '100%', height: '100vh', border: 'none' }}
    title={src}
  />
);

const meta: Meta<typeof HtmlProposal> = {
  title: 'ui-proposals/SayoChat',
  component: HtmlProposal,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof HtmlProposal>

export const Overview: Story = {
  args: { src: '/ui-proposals/sayo-chat/index.html' },
};

export const ShopPage: Story = {
  args: { src: '/ui-proposals/sayo-chat/a-shop-page.html' },
};

export const FloatingWidget: Story = {
  args: { src: '/ui-proposals/sayo-chat/b-floating-widget.html' },
};

export const NovelStage: Story = {
  args: { src: '/ui-proposals/sayo-chat/c-novel-stage.html' },
};
