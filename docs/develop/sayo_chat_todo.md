# サヨ（AI映画店主）UI Todo（案G）

> 2026-11-23 作成。実装仕様は [`sayo_chat_spec.md`](sayo_chat_spec.md)。
> 全体の計画（Phase 1c の1c-2）の正本は `katsumascore-ai-chat` の `docs/phases.md`。この表はフロント側の写し。
> 受け入れ条件は、ai-chat の `docs/front-implementation-guide.md`（以下「手順書」）の2章・3章・5章。

## 決定事項

- 2026-11-23：画面の置き場所は**案G**（TOP・リストにCSRで重ねる）。手順書の「専用ページ `/ja/chat`（`noindex`）」から変更。
- 変わらないこと：限定公開は合言葉＋sid（`/session` でCookieを受け取ってから `/message`）。合言葉は入力欄で入れ、メモリだけに持つ。`ja` のみ。

## 未決（先に決める）

- [ ] **合言葉の入口**：LLMを使わない部分（要約・候補ボタン）を合言葉なしで見せてよいか。合言葉が要る場合、入口をどこに置くか（仕様 §10-1）。G2・G4 と、ai-chat のAPI追加の前提。
- [ ] **ai-chat のAPI追加**（仕様 §8）：`GET /api/chat/articles/{id}/summary`、気分タグ・カテゴリで記事を返すAPI、`MessageRequest` の `articleId`。ai-chat 側でSchemaと `test/api` の例を先に更新する。

## Todo

| # | 内容 | 状態 | 旧手順（手順書3章） |
|---|---|---|---|
| G1 | Storybookでの部品：色のトークン・仮画像、ui-parts、ui-section、`features/sayo`（架空の `SayoClient`）、カードの `action` スロット、各部品の `i18n.ts`、状態ごとのStory | この PR（#298）で作成。マージで済 | F4・F6・F7の一部 |
| G2 | #298の直し：表情は `MessageResponse` の `expression` を使う（`thinking` だけ画面で決める。仕様の「APIは表情を返さない」は誤り）。合言葉のフォームと `/session` の呼び出しを `SayoClient` に加える。ネタバレの履歴・要約の混在・映画リストの範囲（`g-summary-novel-review-instructions.md`） | 未 | F3・F4 |
| G3 | 会話ログと書き出し（手順書2.6）：ノベル画面の往復をメモリで並べ、「この回答をコピー」「会話をすべてコピー」（シート用の10列・文）と代替の `textarea`。テスターのシート記入に要る | 未 | F4 |
| G4 | 本番の `SayoClient`（`src/libs/api/sayoChat.ts`）：zodで検証、合わないときは `error`。HTTPのコードにかかわらず本文を読む。相対パスだけ | 未 | F1 |
| G5 | 表示・停止フラグ：WordPress側 `/wp-json/v1/sayo-chat-status` と、Nextの `/api/sayo-chat-status`（30秒キャッシュ）。取得に失敗したら出さない | 未 | — |
| G6 | ローカル確認用のモック：`NEXT_PUBLIC_CHAT_MOCK=1` のときだけ有効。手順書2.4の全 `status` を返せる。本番のビルドで有効にならない | 未 | F2 |
| G7 | 状態管理の確かめ：二重送信の防止、`session_expired` のあと同じ質問を1回だけ送り直す、自動の再送をしない、停止中・上限・`health` の `enabled: false` でLLMを使う操作だけ止める | 未 | F3 |
| G8 | TOP・リストへの組み込み：`HomeTemplate`・`ListTemplate` で `SayoGate` の内側から `SayoCardAction` を渡し、`SayoEntry` を置く。ページ本体のISR・キャッシュを変えない | 未 | F5 |
| G9 | テスト：ユニット（クライアントの検証、200字の数え方、再送が1回だけ、書き出しが画面と同じで合言葉を含まない、10列が改行・タブ・`=` で崩れない）、E2E（モックで合言葉→質問→回答→記事カード→コピーの中身が画面と一致） | 未 | F7 |
| G10 | 本番での疎通確認：手順書5章のV1〜V8を、TOP・リストで（V1・V8は読み替え）。デプロイのあと | 未 | F8 |

## 順番

G1（この PR）→ 未決の2つ → G2〜G5（並行できる）→ G6・G7 → G8 → G9 → デプロイ → G10。
G3（書き出し）が済み、G10と、シートの雛形への貼り付け確認（V7c）が済むまで、テスターには案内しない。

## 注意（手順書6章）

- 自動での再送・再試行をしない。
- 合言葉を保存しない（`localStorage`・Cookie・URL・ログ）。
- `reply` をHTMLとして描画しない。
- `status` の理由を推測して表示しない。
