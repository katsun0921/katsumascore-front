import type { Meta, StoryObj } from '@storybook/react-vite';
import { SeasonalWorkCard } from './SeasonalWorkCard';

const meta: Meta<typeof SeasonalWorkCard> = {
  title: 'ui-parts/SeasonalWorkCard',
  component: SeasonalWorkCard,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof SeasonalWorkCard>;

export const Default: Story = {
  args: {
    title: '薬屋のひとりごと 第3期 前半',
    summary:
      '花街に戻った薬師・猫猫と皇弟としての責務に向き合う壬氏が、災害の予兆や仙女の噂をめぐる新たな謎に挑む。',
    officialUrl: 'https://example.com/kusuriya/',
    officialLabel: '公式サイト',
    vods: [
      { label: 'dアニメストア', key: 'dアニメストア', colorVar: null, isUndecided: false },
      { label: 'U-NEXT', key: 'U-NEXT', colorVar: 'var(--color-unext)', isUndecided: false },
    ],
  },
};

/** 検索語に一致した箇所を `<mark>` で強調する */
export const Highlighted: Story = {
  args: {
    ...Default.args,
    highlight: '薬',
  },
};

/** 公式サイトが未入力なら、リンクを出さない */
export const WithoutOfficialUrl: Story = {
  args: {
    ...Default.args,
    officialUrl: null,
  },
};

/** 配信未発表の行も、入稿された文言のままバッジに出す */
export const Undecided: Story = {
  args: {
    ...Default.args,
    vods: [{ label: '配信サービス未発表', key: '配信サービス未発表', colorVar: null, isUndecided: true }],
  },
};
