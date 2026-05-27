import type { ParsedWPPost } from "@/libs/api/wordpress";
import type { TStreamingVodEntry } from "@/components/features/StreamingVod";
import type { TRentalService } from "@/components/features/AdRental";

/** サービスキー → 配信サービストップ URL のマップ。 */
const VOD_SERVICE_URLS: Partial<Record<import("@/components/features/StreamingVod").TStreamingVodEntry["service"], string>> = {
  amazon: "https://www.amazon.co.jp/gp/video/storefront",
  netflix: "https://www.netflix.com",
  hulu: "https://www.hulu.jp",
  unext: "https://video.unext.jp",
  appletv: "https://tv.apple.com",
  disney: "https://www.disneyplus.com",
  dmmtv: "https://tv.dmm.com",
  abema: "https://abema.tv",
  rakuten: "https://movie.rakuten.co.jp",
  youtube: "https://www.youtube.com",
};

/** ACF の旧配信フラグ（netflix / amazon / hulu / unext）チェック用マッピング。 */
const ACF_VOD_STATUS_FIELDS: Array<{
  field: keyof NonNullable<ParsedWPPost["acf"]>;
  service: import("@/components/features/StreamingVod").TStreamingVodEntry["service"];
}> = [
  { field: "amazon_prime_video", service: "amazon" },
  { field: "netflix", service: "netflix" },
  { field: "hulu", service: "hulu" },
  { field: "unext", service: "unext" },
];

/** `_` → `-`、地域接尾辞除去で WP vod ターム slug を正規化する。 */
const normalizeVodSlug = (raw: string): string => {
  let s = raw.trim().toLowerCase().replace(/_/g, "-");
  const suffixes = ["-cojp", "-com", "-jp", "-ja"] as const;
  for (const suf of suffixes) {
    if (s.endsWith(suf)) { s = s.slice(0, -suf.length); break; }
  }
  return s;
};

/** 正規化済み WP vod ターム slug → TStreamingVodEntry["service"] の逆引き。 */
const VOD_TERM_SLUG_TO_SERVICE: Record<string, import("@/components/features/StreamingVod").TStreamingVodEntry["service"]> = {
  "netflix": "netflix",
  "amazon-prime-video": "amazon",
  "u-next": "unext",
  "hulu": "hulu",
  "disneyplus": "disney",
  "dmmtv": "dmmtv",
  "abema-tv": "abema",
  "abema": "abema",
  "apple-tv": "appletv",
  "apple-tv-plus": "appletv",
  "rakuten-tv": "rakuten",
  "youtube": "youtube",
};

/**
 * ACF の配信フラグと `_embedded["wp:term"]` の vod タクソノミーから
 * 対応サービスの固定リンク一覧を作る。
 */
export const buildStreamingVods = (wp: ParsedWPPost): TStreamingVodEntry[] | undefined => {
  const acf = wp.acf;
  const out: TStreamingVodEntry[] = [];
  const addedServices = new Set<string>();

  const push = (service: import("@/components/features/StreamingVod").TStreamingVodEntry["service"]) => {
    if (addedServices.has(service)) return;
    const url = VOD_SERVICE_URLS[service];
    if (!url) return;
    out.push({ service, url });
    addedServices.add(service);
  };

  // 旧 ACF フラグ（amazon / netflix / hulu / unext）
  if (acf) {
    for (const { field, service } of ACF_VOD_STATUS_FIELDS) {
      if ((acf[field] as { status?: unknown } | undefined)?.status === "streaming") {
        push(service);
      }
    }
  }

  // _embedded["wp:term"] の vod タクソノミーから全サービスを補完する
  const embeddedTerms = wp._embedded?.["wp:term"];
  if (Array.isArray(embeddedTerms)) {
    for (const group of embeddedTerms) {
      if (!Array.isArray(group)) continue;
      for (const term of group) {
        const t = term as Record<string, unknown>;
        const taxRaw = typeof t.taxonomy === "string" ? t.taxonomy : "";
        if (taxRaw.replace(/^wp_/i, "").toLowerCase() !== "vod") continue;
        const slug = typeof t.slug === "string" ? normalizeVodSlug(t.slug) : "";
        const service = VOD_TERM_SLUG_TO_SERVICE[slug];
        if (service) push(service);
      }
    }
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
