import type { ReleaseWorkItem } from '@/libs/releaseWorks';

export type ReleaseHighlightBlock = {
  /** 週次まとめ記事詳細へのリンク */
  href: string;
  /** まとめ記事から抽出した作品リスト。抽出できなかった場合は空配列 */
  works: ReleaseWorkItem[];
  /** まとめ記事タイトル（作品リストが空のときのフォールバック表示に使う） */
  articleTitle: string;
};

export type HomeReleaseHighlightProps = {
  theaterTitle: string;
  vodTitle: string;
  seeAllLabel: string;
  theater?: ReleaseHighlightBlock;
  vod?: ReleaseHighlightBlock;
};
