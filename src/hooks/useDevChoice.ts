'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { devToolsStore } from '@/libs/devtools';

export type UseDevChoiceOptions = {
  /** 値を変えたあとにページを再読み込みして反映するか（既定 true）。再読み込みなしで反映できる設定だけ false にする */
  reload?: boolean;
};

/**
 * 開発者ツールの「選択肢から1つ選ぶ設定」を読み書きする（機能ごとにキーを分ける。例: `sayo.dataSource`、`ab.homeLayout`）。
 * 値を変えると保存し、既定では再読み込みして反映する（取得済みの画面状態を引きずらないため）。開発サーバー以外では常に既定値
 * @param key 設定のキー
 * @param allowed 選択肢
 * @param fallback 既定値（選択肢の1つ）
 * @param options 反映の仕方
 * @returns `[選んでいる値, 変更する関数]`
 */
export const useDevChoice = <T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T,
  options: UseDevChoiceOptions = {},
): readonly [T, (value: T) => void] => {
  const { reload = true } = options;
  // サーバー描画・ハイドレーションの間は既定値を返し、不一致を避ける
  const value = useSyncExternalStore(
    devToolsStore.subscribe,
    () => devToolsStore.getChoice(key, allowed, fallback),
    () => fallback,
  );
  const change = useCallback((next: T) => {
    devToolsStore.set(key, next);
    if (reload) window.location.reload();
  }, [key, reload]);
  return [value, change] as const;
};
