import type { ParsedWPPost } from "@/libs/api/wordpress";
import type { TStreamingVodEntry } from "@/components/features/StreamingVod";
import type { TRentalService } from "@/components/features/AdRental";
import { HTTP_URL_RE } from "./constants";

/** ACF passthrough オブジェクトの `url` フィールドを取り出す。なければ fallback を返す。 */
const pickVodUrl = (acfEntry: unknown, fallback: string): string => {
  if (acfEntry && typeof acfEntry === "object" && !Array.isArray(acfEntry)) {
    const raw = (acfEntry as Record<string, unknown>).url;
    if (typeof raw === "string" && HTTP_URL_RE.test(raw.trim())) {
      return raw.trim();
    }
  }
  return fallback;
};

/** ACF の配信フラグから、対応サービスのリンク一覧を作る。ACF に url フィールドがあればそれを使用する。 */
export const buildStreamingVods = (wp: ParsedWPPost): TStreamingVodEntry[] | undefined => {
  const acf = wp.acf;
  if (!acf) return undefined;
  const out: TStreamingVodEntry[] = [];
  if ((acf.amazon_prime_video as { status?: unknown } | undefined)?.status === "streaming") {
    out.push({ service: "prime-video", url: pickVodUrl(acf.amazon_prime_video, "https://www.amazon.co.jp/gp/video/storefront"), viewingType: "subscription" });
  }
  if ((acf.netflix as { status?: unknown } | undefined)?.status === "streaming") {
    out.push({ service: "netflix", url: pickVodUrl(acf.netflix, "https://www.netflix.com"), viewingType: "subscription" });
  }
  if ((acf.hulu as { status?: unknown } | undefined)?.status === "streaming") {
    out.push({ service: "hulu", url: pickVodUrl(acf.hulu, "https://www.hulu.jp"), viewingType: "subscription" });
  }
  if ((acf.unext as { status?: unknown } | undefined)?.status === "streaming") {
    out.push({ service: "unext", url: pickVodUrl(acf.unext, "https://video.unext.jp"), viewingType: "subscription" });
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
