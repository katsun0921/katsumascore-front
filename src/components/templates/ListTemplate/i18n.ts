import { t, type Locale } from '@/i18n/t';

export const messages = {
  breadcrumb: {
    home: { ja: 'ホーム', en: 'Home' },
    vod: { ja: 'VOD', en: 'VOD' },
  },
  category: {
    label: { ja: 'カテゴリ', en: 'Category' },
  },
  filterOptions: {
    score: { ja: '評価順', en: 'By Rating' },
    new: { ja: '新着', en: 'New' },
    streaming: { ja: '配信中', en: 'Streaming' },
    genre: { ja: 'ジャンル', en: 'Genre' },
    tag: { ja: 'タグ', en: 'Tag' },
  },
  empty: {
    posts: { ja: 'この条件に該当する記事はまだありません。', en: 'No posts match this view yet.' },
  },
  listPage: {
    title: {
      index: { ja: '{name} | KatsumaScore', en: '{name} | KatsumaScore' },
      paged: {
        ja: '{name}（{page}ページ目）| KatsumaScore',
        en: '{name} (page {page}) | KatsumaScore',
      },
    },
    meta: {
      index: {
        ja: '{name}の記事一覧 — スコアで選ぶ',
        en: 'Browse {name} — articles picked by score.',
      },
      paged: {
        ja: '{name}の記事一覧（{page}ページ目）',
        en: '{name} — articles, page {page}.',
      },
    },
    categoryDescription: {
      default: {
        ja: '今観るべき{name}作品を、スコアで選ぶ',
        en: 'Top {name} picks to watch now — scored and ranked.',
      },
    },
  },
} as const;

export const formatListPageIndexTitle = (categoryName: string, locale: Locale) =>
  t(messages, ['listPage', 'title', 'index'], locale).replaceAll('{name}', categoryName);

export const formatListPagePagedTitle = (categoryName: string, page: number, locale: Locale) =>
  t(messages, ['listPage', 'title', 'paged'], locale)
    .replaceAll('{name}', categoryName)
    .replaceAll('{page}', String(page));

export const formatListPageIndexMetaDescription = (categoryName: string, locale: Locale) =>
  t(messages, ['listPage', 'meta', 'index'], locale).replaceAll('{name}', categoryName);

export const formatListPagePagedMetaDescription = (
  categoryName: string,
  page: number,
  locale: Locale,
) =>
  t(messages, ['listPage', 'meta', 'paged'], locale)
    .replaceAll('{name}', categoryName)
    .replaceAll('{page}', String(page));

export const formatListPageCategoryDescription = (categoryName: string, locale: Locale) =>
  t(messages, ['listPage', 'categoryDescription', 'default'], locale).replaceAll('{name}', categoryName);
