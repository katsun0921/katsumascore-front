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
  const [state, setState] = useState<ArticleSummaryState>({ summary: null, loading: false, failed: false });
  useEffect(() => {
    if (id === null) return undefined;
    let alive = true;
    setState({ summary: null, loading: true, failed: false });
    client.getSummary(id)
      .then((summary) => { if (alive) setState({ summary, loading: false, failed: false }); })
      .catch(() => { if (alive) setState({ summary: null, loading: false, failed: true }); });
    return () => { alive = false; };
  }, [client, id]);
  return state;
};
