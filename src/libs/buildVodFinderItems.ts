import type { VodFinderItem } from "@/components/ui-home/HomeVodFinder";
import type { VodService } from "@/libs/vod";
import { VOD_LABEL } from "@/libs/vod";

/** VOD 一覧リンク（件数は API 未連携のため省略） */
export const buildVodFinderItemsFromConfig = (): VodFinderItem[] => {
  const services = Object.keys(VOD_LABEL) as VodService[];
  return services.map((vod) => ({
    vod,
    href: `/vod/${vod}`,
  }));
};
