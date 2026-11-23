import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * サヨ会話UIのHTMLモック（src/ui-proposals/sayo-chat/）をStorybookで開くためのラッパー。
 * GitHub Pages などサブパス配信（STORYBOOK_BASE_PATH）でも開けるよう、Vite の base を前に付ける
 */
const HtmlProposal = ({ src }: { src: string }) => (
  <iframe
    src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${src}`}
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

export const Placements: Story = {
  args: { src: '/ui-proposals/sayo-chat/placements.html' },
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

export const CardSummaryModal: Story = {
  args: { src: '/ui-proposals/sayo-chat/d-card-summary.html' },
};

export const CardSummaryPage: Story = {
  args: { src: '/ui-proposals/sayo-chat/e-summary-page.html' },
};

export const JourneyF: Story = {
  args: { src: '/ui-proposals/sayo-chat/f-journey.html' },
};

export const SummaryNovelG: Story = {
  args: { src: '/ui-proposals/sayo-chat/g-summary-novel.html' },
};
