import { useEffect, useState } from 'react';
import type { SayoClient, SayoSummary } from '@/types/sayo';

export type ArticleSummaryState = {
  summary: SayoSummary | null;
  loading: boolean;
  failed: boolean;
};

/**
 * 承認済み要約を取得する（LLMなし・回数を減らさない）。id が変わるたびに読み直す
 * @param client SayoClient
 * @param id 記事ID。null なら読まない
 */
export const useArticleSummary = (client: SayoClient, id: number | null): ArticleSummaryState => {
  // 取得結果は「どの記事IDの結果か」と一緒に持つ。id が変わった直後は結果が合わないので読み込み中として扱う
  const [result, setResult] = useState<{ id: number; summary: SayoSummary | null; failed: boolean } | null>(null);
  useEffect(() => {
    if (id === null) return undefined;
    let alive = true;
    client.getSummary(id)
      .then((summary) => { if (alive) setResult({ id, summary, failed: false }); })
      .catch(() => { if (alive) setResult({ id, summary: null, failed: true }); });
    return () => { alive = false; };
  }, [client, id]);
  const current = id !== null && result?.id === id ? result : null;
  return { summary: current?.summary ?? null, loading: id !== null && current === null, failed: current?.failed ?? false };
};
