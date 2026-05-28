import type { VodService } from "@/libs/vod";
import type { VodFinderItem } from "@/components/ui-home/HomeVodFinder";
import type { WPVodTerm } from "@/libs/api/wordpress/endpoints/vodTaxonomy";

/**
 * フロントの VOD 一覧 URL スラッグ（`/vod/amazon` の `amazon`）から、
 * WordPress `vod` タクソノミーのターム `slug`（REST 検索用）への対応表。
 */
export const VOD_PATH_SLUG_TO_WP_SLUG: Record<VodService, string> = {
  netflix: "netflix",
  'prime-video': "amazon-prime-video",
  unext: "u-next",
  hulu: "hulu",
  disney: "disneyplus",
  dmmtv: "dmmtv",
  abema: "abema_tv",
  appletv: "apple-tv",
  youtube: "youtube",
};

/** `getStaticPaths` 用。フロントの VOD 一覧 URL スラッグ一覧。 */
export const VOD_ARCHIVE_PATH_SLUGS = Object.keys(VOD_PATH_SLUG_TO_WP_SLUG) as VodService[];

/** `VOD_PATH_SLUG_TO_WP_SLUG` のキーに含まれる URL スラッグかどうか。 */
export const isVodPathSlug = (slug: string): slug is VodService =>
  Object.prototype.hasOwnProperty.call(VOD_PATH_SLUG_TO_WP_SLUG, slug);

/**
 * 一覧 URL のスラッグを WP の `vod` ターム slug に解決する。
 * マップに無い値はそのまま返し、WP 上の生 slug 指定（blocking 事前生成外）にも使える。
 */
export const resolveVodWpSlug = (pathSlug: string): string => {
  if (isVodPathSlug(pathSlug)) return VOD_PATH_SLUG_TO_WP_SLUG[pathSlug];
  return pathSlug;
};

/**
 * WP の `vod` ターム slug（例: `amazon-prime-video`）からフロントの `VodService` キー（例: `amazon`）に逆引きする。
 * 一致しない場合は `null`。
 */
export const wpVodSlugToVodService = (wpSlug: string): VodService | null => {
  for (const [pathSlug, registeredWpSlug] of Object.entries(VOD_PATH_SLUG_TO_WP_SLUG)) {
    if (registeredWpSlug === wpSlug) {
      return pathSlug as VodService;
    }
  }
  return null;
};

/**
 * WP `vod` タクソノミーのターム一覧から VOD ハブページ用リンクアイテムを生成する。
 * フロントの `VodService` に対応しないタームはスキップする。
 */
export const buildVodFinderItemsFromTerms = (terms: WPVodTerm[]): VodFinderItem[] => {
  const countMap = new Map<VodService, number>();
  for (const term of terms) {
    const vod = wpVodSlugToVodService(term.slug);
    if (!vod) continue;
    countMap.set(vod, (countMap.get(vod) ?? 0) + term.count);
  }
  const termNames = new Map<VodService, string>();
  for (const term of terms) {
    const vod = wpVodSlugToVodService(term.slug);
    if (!vod || termNames.has(vod)) continue;
    termNames.set(vod, term.name);
  }
  return Array.from(countMap.entries()).map(([vod, count]) => ({
    vod,
    label: termNames.get(vod) ?? vod,
    count,
    href: `/vod/${vod}`,
  }));
};
