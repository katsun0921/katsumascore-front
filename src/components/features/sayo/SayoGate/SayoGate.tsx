import type { ReactNode } from 'react';
import { useSayoOptional } from '@/components/features/sayo/useSayo';

export type SayoGateProps = {
  children: ReactNode;
};

/**
 * サヨを出してよいとき（ja・フラグ取得済み・visible）だけ children を描く。
 * 取得中・取得失敗・Provider の外では何も描かない（場所も取らない）。
 */
export const SayoGate = ({ children }: SayoGateProps) => {
  const sayo = useSayoOptional();
  if (!sayo?.visible) return null;
  return <>{children}</>;
};
