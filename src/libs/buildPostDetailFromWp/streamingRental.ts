import type { ParsedWPPost } from "@/libs/api/wordpress";
import type { TStreamingVodEntry } from "@/components/features/StreamingVod";
import type { TRentalService } from "@/components/features/AdRental";

export const buildStreamingVods = (wp: ParsedWPPost): TStreamingVodEntry[] | undefined => {
  const acf = wp.acf;
  if (!acf) return undefined;
  const out: TStreamingVodEntry[] = [];
  if (acf.streaming_vod_netflix) {
    out.push({ service: "netflix", url: "https://www.netflix.com" });
  }
  if (acf.streaming_vod_amazon) {
    out.push({ service: "amazon", url: "https://www.amazon.co.jp/gp/video/storefront" });
  }
  if (acf.streaming_vod_unext) {
    out.push({ service: "unext", url: "https://video.unext.jp" });
  }
  return out.length > 0 ? out : undefined;
};

export const buildRentalServices = (wp: ParsedWPPost): TRentalService[] | undefined => {
  const rows = wp.acf?.rental_services;
  if (Array.isArray(rows) && rows.length > 0) {
    return rows.map((r) => ({ service: r.service, url: r.url }));
  }
  return undefined;
};
