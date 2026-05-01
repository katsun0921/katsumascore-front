/**
 * スコア4以上の記事一覧からランダムに count 件を抽出する。
 * getServerSideProps（サーバーサイド）で呼び出す。
 * SSRのためリクエストごとに異なる5件が返される。
 */
export const pickRandom = <T>(items: T[], count: number): T[] => {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
