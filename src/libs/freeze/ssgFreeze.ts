/**
 * WordPress 停止に備えた SSG 凍結モードの判定と、ISR 設定の切り替えヘルパー。
 *
 * `NEXT_PUBLIC_SSG_FREEZE=1` でビルドしたときだけ有効になる（クライアントにもビルド時に埋め込まれる）。
 * 無効なときは従来どおりの ISR（`revalidate` + `fallback: 'blocking'`）として動く。
 */

/** SSG 凍結モードかどうか。 */
export const isSsgFreeze = (): boolean => process.env.NEXT_PUBLIC_SSG_FREEZE === '1';

/** `getStaticPaths` の `fallback`。凍結時は実行時に WP へ取りにいかないよう `false` にする。 */
export const freezeFallback = (): false | 'blocking' => (isSsgFreeze() ? false : 'blocking');

/**
 * `getStaticProps` の戻り値へ展開する `revalidate`。凍結時は ISR にしないため空オブジェクトを返す。
 *
 * @param seconds 通常時の再生成間隔（秒）
 */
export const isr = (seconds: number): { revalidate?: number } => (isSsgFreeze() ? {} : { revalidate: seconds });
