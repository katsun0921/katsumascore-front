# サヨ（AI映画店主）UI Todo（案G）

> 2026-11-23 作成。実装仕様は [`sayo_chat_spec.md`](sayo_chat_spec.md)。
> 全体の計画（Phase 1c の1c-2）の正本は `katsumascore-ai-chat` の `docs/phases.md`。この表はフロント側の写し。
> 受け入れ条件は、ai-chat の `docs/front-implementation-guide.md`（以下「手順書」）の2章・3章・5章。

## 決定事項

- 2026-11-23：画面の置き場所は**案G**（TOP・リストにCSRで重ねる）。手順書の「専用ページ `/ja/chat`（`noindex`）」から変更。
- 変わらないこと：限定公開は合言葉＋sid（`/session` でCookieを受け取ってから `/message`）。照合・署名はai-chatのWorker側。`ja` のみ。
- 2026-11-23：**合言葉の入力欄は出さない。** テスターに渡す参加URL（`?key=`）の鍵を、middlewareが読んで ai-chat の `/session` へ送り、返ったCookie（`Path=/api/chat`）を設定する。フロントは合言葉を持たず、保存しない。
- 鍵がない（Cookieが無い・期限切れ）ときは、要約・候補ボタン・「詳しく知りたい」を**無効（disabled）**にして案内文を出し、**通信しない**。
- middlewareは、鍵を受けたらすぐURLから外してリダイレクトする。鍵をログ・例外・解析ツールに出さない。`/session` の失敗は理由を区別しない（案内文も理由を断定しない）。
- 作業は #298 のこのブランチに足す（テストとStorybookも同じブランチ）。

## 決定事項の追加（2026-11-23）

- 要約・候補ボタン（LLMなし）も、**1日の利用回数に数える**。テスターへの依頼金額を、1日の利用回数から算出するため。残り0では、これらも止める。仕様 §3・§4 の「減らない」を直した。回数の数え方（同じ作品の再表示も1回か）は、ai-chat のAPI設計で決める。

## 決定事項の追加（2026-11-24）

- はじめて使う人に利用規約の同意画面を出す（仕様 §3.1）。**同意のチェックの有無は localStorage に保存する**（Cookie と比べた結果。比較表は仕様 §3.1）。保存するのは規約の版だけ。
- 同意画面は `<details>`（`SayoConsentModal`）と `<dialog>`（`SayoConsentDialog`）の2パターンを作った。本番でどちらを使うかは未決。
- 同意のチェックで合言葉を生成しない。限定公開のあいだは、ai-chat の参加専用ページでも同じ規約の同意を取り、同じ localStorage のキーに版を書く（仕様 §3.1）。

## 未決

- [x] **合言葉の入口**：上の決定のとおり（仕様 §10-1 は解決）。
- [ ] **ai-chat のAPI追加**（仕様 §8）：`GET /api/chat/articles/{id}/summary`、気分タグ・カテゴリで記事を返すAPI、`MessageRequest` の `articleId`。ai-chat 側でSchemaと `test/api` の例を先に更新する。

## Todo

| # | 内容 | 状態 | 旧手順（手順書3章） |
|---|---|---|---|
| G1 | Storybookでの部品：色のトークン・仮画像、ui-parts、ui-section、`features/sayo`（架空の `SayoClient`）、カードの `action` スロット、各部品の `i18n.ts`、状態ごとのStory | この PR（#298）で作成。マージで済 | F4・F6・F7の一部 |
| G2 | #298の直し：表情は `MessageResponse` の `expression` を使う（`thinking` だけ画面で決める。仕様の「APIは表情を返さない」は誤り）。合言葉の入力欄は作らず、参加URLの鍵を受ける middleware と、鍵がないときの無効表示（案内文・通信なし）を加える。ネタバレの履歴・要約の混在・映画リストの範囲（`g-summary-novel-review-instructions.md`） | 未 | F3・F4 |
| G3 | 会話ログと書き出し（手順書2.6）：ノベル画面の往復をメモリで並べ、「この回答をコピー」「会話をすべてコピー」（シート用の10列・文）と代替の `textarea`。テスターのシート記入に要る | 未 | F4 |
| G4 | 本番の `SayoClient`（`src/libs/api/sayoChat.ts`）：zodで検証、合わないときは `error`。HTTPのコードにかかわらず本文を読む。相対パスだけ | 未 | F1 |
| G5 | 表示・停止フラグ：WordPress側 `/wp-json/v1/sayo-chat-status` と、Nextの `/api/sayo-chat-status`（30秒キャッシュ）。取得に失敗したら出さない | 未 | — |
| G6 | ローカル確認用のモック：`NEXT_PUBLIC_CHAT_MOCK=1` のときだけ有効。手順書2.4の全 `status` を返せる。本番のビルドで有効にならない | 未 | F2 |
| G7 | 状態管理の確かめ：二重送信の防止、`session_expired` のあと同じ質問を1回だけ送り直す、自動の再送をしない、停止中・上限・`health` の `enabled: false` でLLMを使う操作だけ止める | 未 | F3 |
| G8 | TOP・リストへの組み込み：`HomeTemplate`・`ListTemplate` で `SayoGate` の内側から `SayoCardAction` を渡し、`SayoEntry` を置く。ページ本体のISR・キャッシュを変えない | 未 | F5 |
| G9 | テスト：ユニット（クライアントの検証、200字の数え方、再送が1回だけ、書き出しが画面と同じで合言葉を含まない、10列が改行・タブ・`=` で崩れない）、E2E（モックで合言葉→質問→回答→記事カード→コピーの中身が画面と一致） | 未 | F7 |
| G10 | 本番での疎通確認：手順書5章のV1〜V8を、TOP・リストで（V1・V8は読み替え）。デプロイのあと | 未 | F8 |
| G11 | はじめて使う人への利用規約の同意画面（仕様 §3.1）：`<details>` の規約・チェックボックス・`localStorage` に版を保存し、同意済みなら出さない。同意の前に要約・候補を取得しない。`<details>`（`SayoConsentModal`）と `<dialog>`（`SayoConsentDialog`）の2パターン。本番でどちらを使うかは未決 | 済（2026-11-24） | — |

## 順番

G1（この PR）→ ai-chat のAPI追加 → G2〜G5（並行できる）→ G6・G7 → G8 → G9 → デプロイ → G10。
G3（書き出し）が済み、G10と、シートの雛形への貼り付け確認（V7c）が済むまで、テスターには案内しない。

## 注意（手順書6章）

- 自動での再送・再試行をしない。
- 合言葉を保存しない（`localStorage`・Cookie・URL・ログ）。
- `reply` をHTMLとして描画しない。
- `status` の理由を推測して表示しない。
