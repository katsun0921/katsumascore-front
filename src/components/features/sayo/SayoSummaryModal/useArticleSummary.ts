import { useEffect, useState } from 'react';
import type { SayoClient, SayoSummary } from '@/types/sayo';

export type ArticleSummaryState = {
  summary: SayoSummary | null;
  loading: boolean;
  failed: boolean;
};

/**
 * 承認済み要約を取得する（LLMなし。1日の利用回数には数える）。id が変わるたびに読み直す。
 * 残り0回のときは呼び出し側が id を null にして、取得しない
 * @param client SayoClient
 * @param id 記事ID。null なら読まない
 * @param onRemaining 応答に残り回数があれば受け取る（要約も利用回数に数えるため）
 */
export const useArticleSummary = (client: SayoClient, id: number | null, onRemaining?: (n: number) => void): ArticleSummaryState => {
  // 取得結果は「どの記事IDの結果か」と一緒に持つ。id が変わった直後は結果が合わないので読み込み中として扱う
  const [result, setResult] = useState<{ id: number; summary: SayoSummary | null; failed: boolean } | null>(null);
  useEffect(() => {
    if (id === null) return undefined;
    let alive = true;
    client.getSummary(id)
      .then((summary) => {
        // 回数は、表示を捨てる場合でも使われているので反映する
        if (summary.remaining !== undefined) onRemaining?.(summary.remaining);
        if (alive) setResult({ id, summary, failed: false });
      })
      .catch(() => { if (alive) setResult({ id, summary: null, failed: true }); });
    return () => { alive = false; };
    // onRemaining は呼び出しごとに作られるため依存に入れない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, id]);
  const current = id !== null && result?.id === id ? result : null;
  return { summary: current?.summary ?? null, loading: id !== null && current === null, failed: current?.failed ?? false };
};
