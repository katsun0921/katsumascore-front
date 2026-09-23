import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SeasonalWork } from '@/libs/seasonalWorks';
import { SeasonalWorkExplorer } from './SeasonalWorkExplorer';

const meta: Meta<typeof SeasonalWorkExplorer> = {
  title: 'features/SeasonalWorkExplorer',
  component: SeasonalWorkExplorer,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof SeasonalWorkExplorer>;

/** `extractSeasonalWorks` が返す形に合わせたサンプル。 */
const WORKS: SeasonalWork[] = [
  {
    id: 'seasonal-work-0',
    title: '薬屋のひとりごと 第3期 前半',
    summary:
      '花街に戻った薬師・猫猫と皇弟としての責務に向き合う壬氏が、災害の予兆や仙女の噂をめぐる新たな謎に挑む。',
    officialUrl: 'https://example.com/kusuriya/',
    vods: [
      { label: 'dアニメストア', key: 'dアニメストア', colorVar: null, isUndecided: false },
      { label: 'U-NEXT', key: 'U-NEXT', colorVar: 'var(--color-amazon)', isUndecided: false },
    ],
  },
  {
    id: 'seasonal-work-1',
    title: '転生したら剣でしたⅡ',
    summary:
      '知性を持つ剣“師匠”と黒猫族の少女フランが、進化を目指す旅の途中で浮遊島の迷宮攻略に挑むシリーズ第2期。',
    officialUrl: 'https://example.com/tenken/',
    vods: [{ label: 'ABEMA（独占）', key: 'ABEMA', colorVar: 'var(--color-abema)', isUndecided: false }],
  },
  {
    id: 'seasonal-work-2',
    title: 'アオのハコ Season2',
    summary:
      'バドミントンに励む大喜と、同居する女子バスケ部の先輩・千夏の距離を、部活と恋を通して描く青春ラブストーリー第2期。',
    officialUrl: null,
    vods: [
      { label: 'Netflix', key: 'Netflix', colorVar: 'var(--color-netflix)', isUndecided: false },
      { label: '配信サービス未発表', key: '配信サービス未発表', colorVar: null, isUndecided: true },
    ],
  },
];

export const Default: Story = {
  args: { works: WORKS },
};

/** 配信サービスが1つも無い入稿でも、絞り込み UI を出さずに一覧を表示する */
export const WithoutVods: Story = {
  args: {
    works: WORKS.map((work) => ({ ...work, vods: [] })),
  },
};

export const English: Story = {
  args: { works: WORKS },
  globals: { locale: 'en' },
};
