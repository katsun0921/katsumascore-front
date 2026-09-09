/**
 * `/v1/youtube-free-list` のレスポンス1件を、TOP の
 * 「YouTube で無料配信中」セクション（`HomeYoutubeFree`）の表示データへ変換する。
 *
 * `ui-home` はロジックを持てないため、NEW 判定と日付の整形はここで済ませる。
 */
import type { YoutubeFreeListItem } from "@/libs/api/wordpress";
import type { YoutubeFreeItem } from "@/components/ui-home/HomeYoutubeFree";
import { getPostUrl, resolvePostType } from "@/libs/route";

/**
 * 無料公開の開始からこの日数以内なら NEW バッジを出す。
 *
 * 無料公開そのものが数日〜数週間で終わるため、他セクションの「新着」より短くする。
 * 長くすると掲載中のほぼ全件に NEW が付いて目印にならない。
 */
export const YOUTUBE_FREE_NEW_DAYS = 7;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * 配信開始日からの経過日数を返す。日付として解釈できない場合は `null`。
 *
 * @param startedAt — `Y-m-d` 形式の配信開始日。
 * @param now — 基準日時。省略時は現在時刻。
 */
export const daysSinceStreamingStart = (startedAt: string, now: Date = new Date()): number | null => {
  const parsed = Date.parse(`${startedAt}T00:00:00Z`);
  if (Number.isNaN(parsed)) return null;
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((today - parsed) / MS_PER_DAY);
};

/**
 * `Y-m-d` を `M/D` 形式の表示用ラベルにする。解釈できない場合は `undefined`。
 * 年は落とす。無料公開は長くても数週間のため、年まで出すと情報が増えるだけになる。
 */
const toStartedAtLabel = (startedAt: string): string | undefined => {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startedAt);
  if (!matched) return undefined;
  return `${Number(matched[2])}/${Number(matched[3])}`;
};

/**
 * WP のレスポンス1件を `HomeYoutubeFree` のカードデータへ変換する。
 *
 * @param item — `/v1/youtube-free-list` の items 1要素。
 * @param locale — 記事リンクに使うロケール。
 * @param now — NEW 判定の基準日時（テスト用）。省略時は現在時刻。
 */
export const youtubeFreeItemToCard = (
  item: YoutubeFreeListItem,
  locale: "ja" | "en",
  now: Date = new Date(),
): YoutubeFreeItem => {
  // カテゴリは複数付くことがあるため、記事 URL の解決には先頭を使う（`resolvePostType` の既定は movie）
  const type = resolvePostType(item.categories[0]?.slug);
  const elapsed = item.streamingStartedAt !== null
    ? daysSinceStreamingStart(item.streamingStartedAt, now)
    : null;
  const startedAtLabel = item.streamingStartedAt !== null
    ? toStartedAtLabel(item.streamingStartedAt)
    : undefined;

  return {
    id: String(item.id),
    href: getPostUrl(type, item.slug, locale),
    title: item.title,
    image: item.featuredImage?.url ?? null,
    // 経過日数が負（開始日が未来）でも新着として扱う。予約投稿の取り違えより見落としのほうが痛い
    isNew: elapsed !== null && elapsed <= YOUTUBE_FREE_NEW_DAYS,
    ...(item.score !== null ? { score: item.score } : {}),
    ...(item.channelName !== null ? { channelName: item.channelName } : {}),
    ...(item.youtubeUrl !== null ? { youtubeUrl: item.youtubeUrl } : {}),
    ...(startedAtLabel !== undefined ? { startedAtLabel } : {}),
  };
};
