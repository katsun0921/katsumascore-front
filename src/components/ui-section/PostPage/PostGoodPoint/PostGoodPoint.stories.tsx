import type { Meta, StoryObj } from '@storybook/react-vite';
import { GoodPoint } from './PostGoodPoint';

const meta: Meta<typeof GoodPoint> = {
  title: 'features/GoodPoint',
  component: GoodPoint,
  tags: ['autodocs'],
  args: {
    points: [
      '圧倒的な作画クオリティ',
      '感情を揺さぶるストーリー展開',
      '個性豊かなキャラクターたち',
    ],
  },
};
export default meta;

type Story = StoryObj<typeof GoodPoint>

export const Japanese: Story = {};

export const English: Story = {
  args: {
    points: ['Outstanding animation quality', 'Emotionally gripping story', 'Memorable characters'],
  },
  globals: { locale: 'en' },
};

export const SinglePoint: Story = {
  args: {
    points: ['唯一のおすすめポイントです。'],
  },
};

export const WithRankBadge: Story = {
  args: {
    score: 4.3,
  },
};

export const WithRankBadgeNoRank: Story = {
  args: {
    score: 0.5,
  },
};
