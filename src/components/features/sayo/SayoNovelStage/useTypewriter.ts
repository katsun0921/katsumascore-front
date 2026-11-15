import { useCallback, useEffect, useRef, useState } from 'react';

export type TypewriterState = {
  shown: string;
  done: boolean;
  /** 残りを飛ばして全文を出す */
  skip: () => void;
};

/**
 * 文を1文字ずつ出す。動きを減らす設定（prefers-reduced-motion）では一度に出す。
 * @param text 出す文。変わると最初から出し直す
 * @param speedMs 1文字あたりの間隔
 */
export const useTypewriter = (text: string, speedMs = 28): TypewriterState => {
  // 進み具合は「どの文の分か」と一緒に持つ。文が変わると自動的に最初からになる
  const [progress, setProgress] = useState({ text: '', count: 0 });
  const count = progress.text === text ? progress.count : 0;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  useEffect(() => {
    stop();
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!text) return stop;
    const step = reduce ? text.length : 1;
    timer.current = setInterval(() => {
      setProgress((p) => {
        const next = Math.min((p.text === text ? p.count : 0) + step, text.length);
        if (next >= text.length) stop();
        return { text, count: next };
      });
    }, speedMs);
    return stop;
  }, [text, speedMs]);

  const skip = useCallback(() => { stop(); setProgress({ text, count: text.length }); }, [text]);

  return { shown: text.slice(0, count), done: count >= text.length, skip };
};
