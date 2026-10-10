import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockCuratedSeriesItems } from '@/components/ui-home/mocks/home';
import { HomeCuratedSeries } from './HomeCuratedSeries';

const meta: Meta<typeof HomeCuratedSeries> = {
  title: 'UI-Home/HomeCuratedSeries',
  component: HomeCuratedSeries,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0618', padding: '24px', maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'バイオハザードを観る順番',
    description: '新作公開に合わせて、シリーズを公開順に振り返る。',
    seeAllHref: '/ja/franchise/resident-evil',
    seeAllLabel: 'すべて見る →',
    workCountTemplate: '全{n}作品',
    items: mockCuratedSeriesItems,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongDescription: Story = {
  args: {
    description:
      '新作公開に合わせて、シリーズを公開順に振り返る。映画版とドラマ版で時系列が前後するため、迷わないよう公開順に並べた。'.repeat(2),
  },
};

export const SingleItem: Story = {
  args: { items: mockCuratedSeriesItems.slice(0, 1) },
};

export const NoSeeAll: Story = {
  args: { seeAllHref: null },
};

/** 説明文未入力 → 作品数にフォールバック */
export const NoDescription: Story = {
  args: {
    items: mockCuratedSeriesItems.map((item) => ({ ...item, description: '' })),
  },
};

/** 現状の全ターム（61件）がこの状態 → プレースホルダ */
export const NoImage: Story = {
  args: {
    items: mockCuratedSeriesItems.map((item) => ({ ...item, image: null })),
  },
};

export const English: Story = {
  args: {
    label: 'Resident Evil in release order',
    description: 'Revisit the series ahead of the new film.',
    seeAllLabel: 'See all →',
    workCountTemplate: '{n} titles',
    items: mockCuratedSeriesItems.map((item) => ({ ...item, description: '' })),
  },
  globals: { locale: 'en' },
};
