import type { Meta, StoryObj } from '@storybook/react-vite';
import { GenreNav } from './GenreNav';

const meta: Meta<typeof GenreNav> = {
  title: 'Features/GenreNav',
  component: GenreNav,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof GenreNav>

const TYPICAL_TAGS = [
  { slug: 'western-movie', name: '洋画', count: 42 },
  { slug: 'japanese-movie', name: '邦画', count: 38 },
  { slug: 'drama', name: 'ドラマ', count: 55 },
  { slug: 'anime', name: 'アニメ', count: 61 },
  { slug: 'action', name: 'アクション', count: 29 },
  { slug: 'horror', name: 'ホラー', count: 17 },
  { slug: 'romance', name: 'ラブストーリー', count: 22 },
  { slug: 'suspense', name: 'サスペンス', count: 33 },
];

export const Default: Story = {
  args: { tags: TYPICAL_TAGS },
};

export const WithActive: Story = {
  args: { tags: TYPICAL_TAGS, activeSlug: 'anime' },
};

export const EnglishLocale: Story = {
  globals: { locale: 'en' },
  args: { tags: TYPICAL_TAGS, activeSlug: 'action' },
};

/** ゼロ件 → null レンダリング確認 */
export const Empty: Story = {
  args: { tags: [] },
};

/** アイコンマップにないスラッグ → DEFAULT_ICON にフォールバック */
export const UnknownSlugs: Story = {
  args: {
    tags: [
      { slug: 'unknown-genre-xyz', name: 'なぞのジャンル', count: 1 },
      { slug: 'western-movie', name: '洋画', count: 42 },
      { slug: 'another-unknown', name: '謎ジャンル２', count: 3 },
    ],
  },
};

/** タグ名が非常に長い（折り返し確認） */
export const LongNames: Story = {
  args: {
    tags: [
      { slug: 'drama', name: 'スペシャルドラマ＆ミニシリーズ', count: 5 },
      { slug: 'anime', name: 'オリジナルアニメーション作品', count: 12 },
      { slug: 'western-movie', name: '洋画', count: 40 },
      { slug: 'comedy', name: 'コメディ・笑い飯・爆笑傑作選', count: 8 },
    ],
  },
};

/** Dense: 全15ジャンル */
export const Dense: Story = {
  args: {
    tags: [
      { slug: 'western-movie', name: '洋画', count: 42 },
      { slug: 'japanese-movie', name: '邦画', count: 38 },
      { slug: 'drama', name: 'ドラマ', count: 55 },
      { slug: 'anime', name: 'アニメ', count: 61 },
      { slug: 'action', name: 'アクション', count: 29 },
      { slug: 'horror', name: 'ホラー', count: 17 },
      { slug: 'romance', name: 'ラブストーリー', count: 22 },
      { slug: 'suspense', name: 'サスペンス', count: 33 },
      { slug: 'comedy', name: 'コメディ', count: 19 },
      { slug: 'human-drama', name: 'ヒューマンドラマ', count: 44 },
      { slug: 'sf', name: 'SF', count: 27 },
      { slug: 'fantasy', name: 'ファンタジー', count: 14 },
      { slug: 'documentary', name: 'ドキュメンタリー', count: 9 },
      { slug: 'animation', name: 'アニメーション', count: 31 },
      { slug: 'thriller', name: 'スリラー', count: 20 },
    ],
    activeSlug: 'sf',
  },
};
