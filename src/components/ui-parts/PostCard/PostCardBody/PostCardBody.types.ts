export type PostCardBodyProps = {
  title: string;
  publishedAt?: string;
  excerpt?: string;
  category?: string;
  className?: string;
  /** 一覧検索などでタイトル内キーワードをハイライトする（`<br>` を含むタイトルでは無効） */
  highlightKeyword?: string;
  /** タイトル直下に添える補足キャプション（例: Person詳細ページの出演役名） */
  caption?: string;
};
