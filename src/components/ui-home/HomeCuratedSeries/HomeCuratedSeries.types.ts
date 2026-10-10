import type { Post } from '@/types/post';

/** シリーズ / フランチャイズ枠の 1 項目（表示用に解決済み）。 */
export type CuratedSeriesView = {
  id: string;
  title: string;
  /** シリーズ見出しのリンク先。ページが無いシリーズは null（テキストのみ） */
  href: string | null;
  /** 未入力は空文字（作品数にフォールバックする） */
  description: string;
  image: string | null;
  postCount: number;
  posts: Post[];
};

export type HomeCuratedSeriesProps = {
  label: string;
  /** 「なぜ今これを推すか」。未入力は空文字（段落ごと出さない） */
  description: string;
  seeAllHref: string | null;
  seeAllLabel: string;
  /** 説明文未入力時の作品数表示。`{n}` を件数に置換する（例: 「全{n}作品」） */
  workCountTemplate: string;
  items: CuratedSeriesView[];
};
