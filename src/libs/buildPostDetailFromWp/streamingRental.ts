import type { ParsedWPPost } from "@/libs/api/wordpress";
import type { TStreamingVodEntry } from "@/components/features/StreamingVod";
import type { TRentalService } from "@/components/features/AdRental";

/** ACF の配信フラグから、対応サービスの固定リンク一覧を作る。 */
export const buildStreamingVods = (wp: ParsedWPPost): TStreamingVodEntry[] | undefined => {
  const acf = wp.acf;
  if (!acf) return undefined;
  const out: TStreamingVodEntry[] = [];
  if ((acf.amazon_prime_video as { status?: unknown } | undefined)?.status === "streaming") {
    out.push({ service: "amazon", url: "https://www.amazon.co.jp/gp/video/storefront" });
  }
  if ((acf.netflix as { status?: unknown } | undefined)?.status === "streaming") {
    out.push({ service: "netflix", url: "https://www.netflix.com" });
  }
  if ((acf.hulu as { status?: unknown } | undefined)?.status === "streaming") {
    out.push({ service: "hulu", url: "https://www.hulu.jp" });
  }
  if ((acf.unext as { status?: unknown } | undefined)?.status === "streaming") {
    out.push({ service: "unext", url: "https://video.unext.jp" });
  }
  return out.length > 0 ? out : undefined;
};

/** `rental_services` リピーターをそのまま UI 用の行配列に写す。 */
export const buildRentalServices = (wp: ParsedWPPost): TRentalService[] | undefined => {
  const rows = wp.acf?.rental_services;
  if (Array.isArray(rows) && rows.length > 0) {
    return rows.map((r) => ({ service: r.service, url: r.url }));
  }
  return undefined;
};
