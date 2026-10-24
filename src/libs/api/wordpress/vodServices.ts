/** ブラウザでも使用する配信サービス名の純粋変換。WP通信・環境変数へ依存しない。 */
import type { VodService } from "@/libs/vod";

/**
 * WP の ACF フィールド名 → フロントの `VodService` への対応。
 *
 * WP は ACF のフィールド名をそのまま返すため、`prime-video` 等の
 * フロント側の語彙へ変換する必要がある。
 * 対象4フィールドは WP 側の `KATSUMASCORE_STREAMING_ACF_FIELDS` と対応している。
 */
const ACF_FIELD_TO_VOD_SERVICE: Record<string, VodService> = {
  netflix: "netflix",
  amazon_prime_video: "prime-video",
  hulu: "hulu",
  unext: "unext",
};

/** WP が返す ACF フィールド名の配列を `VodService[]` へ変換する。未知の名前は捨てる。 */
export const toVodServices = (acfFieldNames: string[]): VodService[] => {
  const services: VodService[] = [];
  for (const name of acfFieldNames) {
    const service = ACF_FIELD_TO_VOD_SERVICE[name];
    if (service !== undefined) services.push(service);
  }
  return services;
};

