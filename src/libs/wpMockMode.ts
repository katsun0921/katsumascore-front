/**
 * WordPress REST の代わりに `src/mocks/wp` の固定データを返すモード。
 *
 * - `USE_WP_MOCK=true` / `1` … 常にモック（本番ビルドでも WP に繋がない）
 * - `USE_WP_MOCK=false` / `0` … 常に WP 取得（開発でも実 API を使う）
 * - 未設定 … `NODE_ENV === "development"` のときだけモック
 */
export const isWpMockMode = (): boolean => {
  const raw = process.env.USE_WP_MOCK?.trim().toLowerCase();
  if (raw === "true" || raw === "1") return true;
  if (raw === "false" || raw === "0") return false;
  return process.env.NODE_ENV === "development";
};
