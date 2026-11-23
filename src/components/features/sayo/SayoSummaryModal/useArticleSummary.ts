import { useEffect, useRef, useState } from 'react';
import type { SayoClient, SayoSummary } from '@/types/sayo';

export type ArticleSummaryState = {
  summary: SayoSummary | null;
  loading: boolean;
  failed: boolean;
  /** 残り0回のため取得しなかった（読み込み済みの要約があれば false） */
  limited: boolean;
};

/**
 * 承認済み要約を取得する（LLMなし。1日の利用回数には数える）。id が変わるたびに読み直す。
 * canFetch が false のとき（残り0回）は、新しい要約を取得しない。読み込み済みの要約は、取得で回数が0になっても表示し続ける
 * @param client SayoClient
 * @param id 記事ID。null なら読まない
 * @param onRemaining 応答に残り回数があれば受け取る（要約も利用回数に数えるため）
 * @param canFetch 新しく取得してよいか（残り回数が1以上）
 */
export const useArticleSummary = (client: SayoClient, id: number | null, onRemaining?: (n: number) => void, canFetch = true): ArticleSummaryState => {
  // 取得結果は「どの記事IDの結果か」と一緒に持つ。id が変わった直後は結果が合わないので読み込み中として扱う
  const [result, setResult] = useState<{ id: number; summary: SayoSummary | null; failed: boolean } | null>(null);
  // 取得するかどうかは id が変わった時点の値で決める（依存に入れると、回数が減るたびに読み直してしまう）
  const canFetchRef = useRef(canFetch);
  useEffect(() => { canFetchRef.current = canFetch; }, [canFetch]);
  useEffect(() => {
    if (id === null || !canFetchRef.current) return undefined;
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
  const waiting = id !== null && current === null;
  return { summary: current?.summary ?? null, loading: waiting && canFetch, failed: current?.failed ?? false, limited: waiting && !canFetch };
};
