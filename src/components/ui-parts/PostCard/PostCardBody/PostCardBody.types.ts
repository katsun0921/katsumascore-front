export type PostCardBodyProps = {
  title: string;
  publishedAt?: string;
  excerpt?: string;
  category?: string;
  className?: string;
  /** 一覧検索などでタイトル内キーワードをハイライトする（`<br>` を含むタイトルでは無効） */
  highlightKeyword?: string;
};
