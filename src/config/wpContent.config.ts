/**
 * WordPress 連携用の固定スラッグ・REST コレクション名、および記事タイプ別アーカイブナビ。
 * 環境変数では持たず、本番／開発で値を変える必要があるときのみこのファイルを編集する。
 */
import type { Locale } from "@/i18n/t";
import type { PostType } from "@/libs/route";

/** 季節レビュー親固定ページのスラッグ（`getPageBySlug` → 子ページ取得） */
export const WP_SEASONAL_REVIEW_PARENT_SLUG = "seasonal-anime-and-dramas-reviews";

/** `/featured` で使うカテゴリのスラッグ */
export const WP_FEATURED_CATEGORY_SLUG = "featured";

/** ホーム・アニメ一覧で優先するカテゴリのスラッグ（無ければ名称ヒューリスティック） */
export const WP_ANIME_CATEGORY_SLUG = "anime";

/** 映画カテゴリのスラッグ（一覧・ホーム特集フォールバック等） */
export const WP_MOVIE_CATEGORY_SLUG = "movie";

/** ドラマカテゴリのスラッグ */
export const WP_DRAMA_CATEGORY_SLUG = "drama";

/** カスタムタクソノミー `genre` の REST コレクション名（`rest_base`） */
export const WP_GENRE_REST_PATH = "genre";

/** カスタムタクソノミー `vod` の REST コレクション名（`rest_base`） */
export const WP_VOD_REST_PATH = "vod";

export type PostTypeArchiveNavItem = {
  postType: PostType;
  label: Record<Locale, string>;
};

/**
 * 映画 / アニメ / ドラマの記事一覧（アーカイブ）へのナビ用定義。
 * Footer・HeaderNav 等で共有する。
 */
export const POST_TYPE_ARCHIVE_NAV_ITEMS = [
  { postType: "movie" as const, label: { ja: "映画", en: "Movies" } },
  { postType: "anime" as const, label: { ja: "アニメ", en: "Anime" } },
  { postType: "drama" as const, label: { ja: "ドラマ", en: "Drama" } },
] as const satisfies readonly PostTypeArchiveNavItem[];
