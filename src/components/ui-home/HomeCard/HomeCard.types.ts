import type { ReactNode } from 'react';
import type { Post } from '@/types/post';

export type HomeCardProps = {
  post: Post;
  className?: string;
  /**
   * 画像の右上に重ねる操作（例：サヨの「要約」ボタン）。
   * カードのリンクの「隣」に置くため、<a> の中に <button> が入らない。
   */
  action?: ReactNode;
};
