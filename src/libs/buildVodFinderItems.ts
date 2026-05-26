import type { VodFinderItem } from "@/components/ui-home/HomeVodFinder";
import type { VodService } from "@/libs/vod";
import { VOD_LABEL } from "@/libs/vod";
import type { WPVodTerm } from "@/libs/api/wordpress/endpoints/vodTaxonomy";
import { wpVodSlugToVodService } from "@/libs/vodPathToWpSlug";

/** VOD 一覧リンク（件数は API 未連携のため省略）。全定義から生成するフォールバック用。 */
export const buildVodFinderItemsFromConfig = (): VodFinderItem[] => {
  const services = Object.keys(VOD_LABEL) as VodService[];
  return services.map((vod) => ({
    vod,
    href: `/vod/${vod}`,
  }));
};

/**
 * WP `vod` タクソノミーのターム一覧から VOD ハブページ用リンクアイテムを生成する。
 * WP に登録されているサービスのみを表示対象とする。
 * フロントの `VodService` に対応しないタームはスキップする。
 * WP 側に `-jp` / `-com` など接尾辞違いの重複タームが存在する場合、同一サービスの件数を合算して1件出力する。
 */
export const buildVodFinderItemsFromTerms = (terms: WPVodTerm[]): VodFinderItem[] => {
  const countMap = new Map<VodService, number>();
  for (const term of terms) {
    const vod = wpVodSlugToVodService(term.slug);
    if (!vod) continue;
    countMap.set(vod, (countMap.get(vod) ?? 0) + term.count);
  }
  return Array.from(countMap.entries()).map(([vod, count]) => ({
    vod,
    count,
    href: `/vod/${vod}`,
  }));
};
