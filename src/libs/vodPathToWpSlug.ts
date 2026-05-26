import type { VodService } from "@/libs/vod";
import { VOD_LABEL } from "@/libs/vod";
import type { VodFinderItem } from "@/components/ui-home/HomeVodFinder";
import type { WPVodTerm } from "@/libs/api/wordpress/endpoints/vodTaxonomy";

/**
 * フロントの VOD 一覧 URL スラッグ（`/vod/amazon` の `amazon`）から、
 * WordPress `vod` タクソノミーのターム `slug`（REST 検索用）への対応表。
 *
 * WP 側のターム統一後スラッグに合わせて管理する。
 * マージ前は `-jp` / `-com` / `-ja` 接尾辞付きで登録されているが、
 * `normalizeVodSlugKeyForMatch` / `vodWpSlugLookupCandidates` が接尾辞を吸収するため
 * この表はマージ後の統一スラッグを記載すればよい。
 */
export const VOD_PATH_SLUG_TO_WP_SLUG: Record<VodService, string> = {
  netflix: "netflix",
  amazon: "amazon-prime-video",
  unext: "u-next",
  hulu: "hulu",
  disney: "disneyplus",
  dmmtv: "dmmtv",
  abema: "abema_tv",
  appletv: "apple-tv",
  rakuten: "rakuten-tv",
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
 * `getVodTermBySlug` に渡す slug の試行順。WP が `netflix-jp` のように地域接尾辞付きで
 * 登録している場合に、`netflix` だけでは REST が空になるのを防ぐ。
 */
export const vodWpSlugLookupCandidates = (pathSlug: string): string[] => {
  const trimmed = pathSlug.trim();
  if (!trimmed) return [];
  const primary = resolveVodWpSlug(trimmed);
  const candidates: string[] = [];
  const add = (s: string) => {
    const t = s.trim();
    if (!t) return;
    if (!candidates.includes(t)) candidates.push(t);
  };
  add(primary);
  if (primary !== trimmed) add(trimmed);
  if (isVodPathSlug(trimmed)) {
    const suffixes = ["-jp", "-cojp", "-com", "-ja"] as const;
    for (const suf of suffixes) {
      add(`${primary}${suf}`);
    }
  }
  return candidates;
};

/** ターム一覧から slug を突き合わせるとき用（`-jp` 接尾辞や `_` / `-` の差を吸収）。 */
export const normalizeVodSlugKeyForMatch = (s: string): string => {
  let x = s.trim().toLowerCase();
  const suffixes = ["-cojp", "-com", "-jp", "-ja"] as const;
  for (let i = 0; i < suffixes.length; i += 1) {
    const suf = suffixes[i];
    if (x.endsWith(suf)) {
      x = x.slice(0, -suf.length);
      break;
    }
  }
  return x.replace(/_/g, "-");
};

/** 一覧の見出し用。既知サービスは `VOD_LABEL`、それ以外は WP の表示名をそのまま使う。 */
export const vodArchiveDisplayName = (pathSlug: string, wpTermName: string): string => {
  if (isVodPathSlug(pathSlug)) return VOD_LABEL[pathSlug];
  return wpTermName;
};

/**
 * WP の `vod` ターム slug（例: `amazon-prime-video`）からフロントの `VodService` キー（例: `amazon`）に逆引きする。
 * `normalizeVodSlugKeyForMatch` で正規化してから突き合わせるため、接尾辞や区切り文字の差を吸収する。
 * 一致しない場合は `null`。
 */
export const wpVodSlugToVodService = (wpSlug: string): VodService | null => {
  const normalized = normalizeVodSlugKeyForMatch(wpSlug);
  for (const [pathSlug, registeredWpSlug] of Object.entries(VOD_PATH_SLUG_TO_WP_SLUG)) {
    if (normalizeVodSlugKeyForMatch(registeredWpSlug) === normalized) {
      return pathSlug as VodService;
    }
  }
  return null;
};

/**
 * WP `vod` タクソノミーのターム一覧から VOD ハブページ用リンクアイテムを生成する。
 * フロントの `VodService` に対応しないタームはスキップする。
 * 重複ターム（`-jp` / `-com` 接尾辞違い等）は同一サービスの件数を合算して1件出力する。
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
