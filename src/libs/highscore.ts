/**
 * 高スコア記事のランダム抽出（主に詳細ページサイド用）。
 *
 * スコア4以上の記事一覧からランダムに count 件を抽出する。
 * getServerSideProps（サーバーサイド）で呼び出す。
 * SSRのためリクエストごとに異なる5件が返される。
 */
/** 配列をシャッフル相当に並べ替えたうえで先頭 `count` 件を返す（順序は非決定的）。 */
export const pickRandom = <T>(items: T[], count: number): T[] => {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
