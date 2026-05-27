/**
 * ISR の revalidate 値（秒）を一元管理する。
 * ページファイルに直接数値を書かず、必ずここの定数を参照すること。
 *
 * 値を変更したい場合はこのファイルのみ編集する。
 */

/** トップページ・記事詳細・actor など更新頻度が高めのページ（5分） */
export const REVALIDATE_HIGH = 300;

/** 一般一覧系（featured / movie / anime / drama / genre / tag / seasonal 等）（10分） */
export const REVALIDATE_NORMAL = 600;

/** franchise など中程度の更新頻度（1時間） */
export const REVALIDATE_LOW = 60 * 60;

/**
 * VOD 一覧・カテゴリー一覧・person / company など更新頻度が低いページ（1日）。
 * Cloudflare Workers のサブリクエスト数超過（エラー 1102）対策として
 * 再生成頻度を抑制するために使用する。
 */
export const REVALIDATE_DAILY = 60 * 60 * 24;

/** notFound 時のフォールバック revalidate（1分）。新規パスが追加された際に素早く拾う */
export const REVALIDATE_NOT_FOUND = 60;
