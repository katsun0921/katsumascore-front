import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockHeroData } from '@/components/ui-home/mocks/home';
import { HomeHero } from './HomeHero';

const meta: Meta<typeof HomeHero> = {
  title: 'Features/HomeHero',
  component: HomeHero,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockHeroData,
};

export const SingleSlide: Story = {
  args: {
    slides: [mockHeroData.slides[0]],
  },
};

export const LongTitle: Story = {
  args: {
    slides: [
      {
        ...mockHeroData.slides[0],
        title: '非常に長いタイトルの映画作品：サブタイトルが続いてさらに長くなるケースを検証するためのテスト用タイトル',
      },
      ...mockHeroData.slides.slice(1),
    ],
  },
};

export const LowScore: Story = {
  args: {
    slides: [
      { ...mockHeroData.slides[0], score: 4.2, rank: 'B' },
      { ...mockHeroData.slides[1], score: 3.1, rank: 'C' },
    ],
  },
};

/** 8件プールからランダム3件を選ぶ — リロードごとに表示が変わる */
export const RandomPool: Story = {
  args: mockHeroData,
};
