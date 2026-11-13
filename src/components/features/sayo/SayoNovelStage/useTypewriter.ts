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
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  useEffect(() => {
    stop();
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !text) { setCount(text.length); return stop; }
    setCount(0);
    timer.current = setInterval(() => {
      setCount((c) => {
        if (c + 1 >= text.length) stop();
        return c + 1;
      });
    }, speedMs);
    return stop;
  }, [text, speedMs]);

  const skip = useCallback(() => { stop(); setCount(text.length); }, [text]);

  return { shown: text.slice(0, count), done: count >= text.length, skip };
};
