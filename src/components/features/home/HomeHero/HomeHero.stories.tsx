import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockHeroData } from '@/components/features/home/mocks/home';
import { HomeHero } from './HomeHero';

const meta: Meta<typeof HomeHero> = {
  title: 'Features/Home/HomeHero',
  component: HomeHero,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: mockHeroData,
};

export const NoVods: Story = {
  args: {
    ...mockHeroData,
    vods: [],
  },
};

export const HighScore: Story = {
  args: {
    ...mockHeroData,
    score: 4.5,
    rank: 'S',
  },
};

export const LongTitle: Story = {
  args: {
    ...mockHeroData,
    title: '非常に長いタイトルの映画作品：サブタイトルが続いてさらに長くなるケースを検証するためのテスト用タイトル',
  },
};
