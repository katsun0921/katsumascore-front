import type { Locale } from '@/i18n/t';
import type { PostType } from '@/libs/route';

export type PostTypeArchiveNavItem = {
  postType: PostType
  label: Record<Locale, string>
};

/**
 * 映画 / アニメ / ドラマ の記事一覧（アーカイブ）へのナビ用定義。
 * Footer・HeaderNav 等で共有する。
 */
export const POST_TYPE_ARCHIVE_NAV_ITEMS = [
  { postType: 'movie' as const, label: { ja: '映画', en: 'Movies' } },
  { postType: 'anime' as const, label: { ja: 'アニメ', en: 'Anime' } },
  { postType: 'drama' as const, label: { ja: 'ドラマ', en: 'Drama' } },
] as const satisfies readonly PostTypeArchiveNavItem[];
