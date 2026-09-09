/** TOP の「YouTube で無料配信中」セクション1件分の表示データ。 */
export type YoutubeFreeItem = {
  id: string;
  /** レビュー記事へのリンク（ロケール込みのフルパス） */
  href: string;
  title: string;
  image: string | null;
  score?: number;
  /** 無料公開しているチャンネル名（例: 【公式】プレシディオチャンネル） */
  channelName?: string;
  /** 無料公開している YouTube 動画の URL */
  youtubeUrl?: string;
  /** 無料公開の開始日を表示用に整形した文字列（例: `9/8`）。未取得の場合は省略 */
  startedAtLabel?: string;
  /**
   * 直近に無料公開が始まったか。`true` のとき NEW バッジを出す。
   * 判定（何日以内を新着とするか）はデータ組み立て側で済ませる。
   * ui-home はロジックを持たないため、ここでは受け取った値を表示するだけ。
   */
  isNew: boolean;
};

export type HomeYoutubeFreeProps = {
  title: string;
  /** 「無料」を表すバッジのラベル */
  freeLabel: string;
  /** 期間限定である旨の注意書き */
  note: string;
  /** NEW バッジのラベル */
  newLabel: string;
  /** 各カードの YouTube リンクのラベル */
  watchLabel: string;
  /** `startedAtLabel` に添える接尾辞（例: `〜 無料`） */
  startedAtSuffix: string;
  items: YoutubeFreeItem[];
};
