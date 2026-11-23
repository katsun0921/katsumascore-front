'use client';

/**
 * SayoProvider に渡す SayoClient を選ぶ hook。TOP・リストへの組み込み（G8）で使う。
 * まだ import されていないのは、組み込み前のため（G8 で SayoProvider の `client` にこの戻り値を渡す）。削除しないこと。
 */
import { useMemo } from 'react';
import type { SayoClient } from '@/types/sayo';
import { resolveSayoClient } from './resolveSayoClient';

/**
 * 開発者ツールの設定に従って SayoClient を返す。設定は再読み込みで反映する（取得済みの画面状態を引きずらないため）
 * @param apiClient 本番の SayoClient（G4）
 */
export const useSayoClient = (apiClient: SayoClient): SayoClient => useMemo(() => resolveSayoClient(apiClient), [apiClient]);
