import type { Post } from '@/types/post';

export type HomeCuratedPostsProps = {
  label: string;
  /** 「なぜ今これを推すか」。未入力は空文字（段落ごと出さない） */
  description: string;
  /** 一覧ページへのリンク。無ければ「すべて見る」を出さない */
  seeAllHref: string | null;
  seeAllLabel: string;
  posts: Post[];
};
