# サヨ（AI映画店主）UI Todo（案G）

2026-11-23時点。この表がフロント側の作業一覧（旧版を置き換えた）。正は[phases.md](https://github.com/katsun0921/katsumascore-ai-chat/blob/main/docs/phases.md)の1c-2（G1〜G10）と[フロント実装手順書](sayo_chat_front_guide.md)（正本はai-chatの`docs/front-implementation-guide.md`）。食い違ったらそちらを優先し、この文書を直す。

## 前提

- UIは案G：TOP・リストのカードの「要約」と「何を観ようか迷ったら」から要約モーダルを開き、「詳しく知りたい」でノベル風の全画面に切り替える。仕様は[`sayo_chat_spec.md`](sayo_chat_spec.md)。
- G1（部品とStorybook）は[#298](https://github.com/katsun0921/katsumascore-front/pull/298)でマージ済み。残りはG2〜G10。
- **ai-chat側のAPI追加（`GET /api/chat/join`・`GET /api/chat/session`・要約`POST`・候補`POST`・`articleId`）は未実装**。本番に出るまで、フロントは`NEXT_PUBLIC_CHAT_MOCK=1`のモックで作る。ローカルの`next dev`からは`Origin`が合わず実APIに届かない。
- `src/pages/api`に`chat`は作らない（`/api/chat/*`はRouteでai-chatのWorkerに先に届く）。

## 決まっていること（作り直さない）

- 合言葉の入力欄は出さない。middlewareも作らない。参加URL（`/api/chat/join#key=…`）はai-chat側のページが受け、ブラウザが`POST /api/chat/session`を呼んでCookie（`ks_chat`、HttpOnly）を設定し、`/ja`へ移る。フロントは合言葉を持たない・保存しない。
- 参加済みかどうかは`GET /api/chat/session`（`{joined, remaining}`。`fetch`は`cache: 'no-store'`）で確かめる。参加していない間は、要約・候補ボタンと「詳しく知りたい」を無効にして案内文を出し、通信しない。
- 要約・候補は`POST`で、フロントが`requestId`を発行する。再試行は同じ`requestId`。成功応答の`remaining`を表示に使う。
- 数え方：要約は新たに取得して成功するたびに1回（開いている間は再利用。閉じて開き直す・再読み込みで取り直せば1回）。候補は押して成功するたびに1回（同じ条件の押し直しも数える。取得済みの再表示は0回）。「詳しく知りたい」の画面遷移は0回。ノベルの自由入力は`/message`の成功1往復で1回。0件・失敗・承認済み要約なしは0回。
- 上限：全アバター合算でsid30回・IP60回/JST日。`429 limit_user`は残り0。
- 止める範囲：`paused`・`health.enabled: false`は、LLMを使う操作（自由入力など）だけ止める。残り0は、回数を数える操作すべてを止める。要約・候補は`/health.enabled`だけで止めず、APIの応答に合わせる（`503 disabled`で止まる。LLMの日次予算切れだけなら、枠に空きがある限り使える）。
- `session_expired`は理由を区別しない。自動の再送はしない。「参加URLをもう一度開いてください」と案内し、ボタンを無効にする。

## 作業（G2〜G10）

### 1. G2 #298の直し

- 表情は`MessageResponse`の`expression`を使う（`thinking`だけ画面で決める）。`SayoMessageResult`に`expression`を足し、`expressionFor`（記事の有無と`status`で決めている）をやめる。
- 参加確認と無効表示：`SayoClient`に参加確認を足す。止める理由に「未参加」を加え、案内文を出す（通信しない）。
- 要約の混在・映画リストの範囲：#298の`g-summary-novel-review-instructions.md`の未確認分を確かめる。
- 済：ネタバレの履歴（伏せ表示と開示）。

### 2. G4 本番の`SayoClient`

- `src/libs/api/sayoChat.ts`を作る。zodで検証し、合わないときは`error`。HTTPのコードにかかわらず本文を読む。相対パスだけ。
- 関数：参加確認`GET /session`、要約`POST /articles/{id}/summary`、候補`POST`、会話`POST /message`、`GET /health`。
- 要約・候補は`requestId`を付ける。同じ`requestId`を別の記事・条件に使わない。

### 3. G6 ローカル確認用のモック

- `NEXT_PUBLIC_CHAT_MOCK=1`のときだけ、本番の`SayoClient`の代わりに架空の応答を返す。手順書2.4の全`status`と、未参加・残り0・`503 disabled`を返せるようにする。本番のビルドで有効にならないこと。
- Storybook用の`sayoMockClient`はある。切り替えの仕組みを足す。

### 4. G3 会話ログと書き出し

- ノベル画面の往復をメモリで並べる（保存しない）。
- 「この回答をコピー」「会話をすべてコピー」（シート用の10列・文）と、代替の`textarea`。仕様は手順書2.6。合言葉・内部の値を含めない。
- シート用の10列は、改行・タブ・`=`で崩れないようにする。収集の道具（ai-chatの取り込みツール）に要る。

### 5. G7 状態管理の確かめ

- 二重送信の防止、古い応答を捨てる、受付停止と残り0の分離は済。
- 残り：`session_expired`の文が旧「もう一度送ってください」のまま。参加URLの開き直しの案内に直す。
- 要約・候補に`requestId`と`remaining`の扱いを入れる。

### 6. G9 テスト

- ユニット：クライアントの検証、200字の数え方、`session_expired`で自動の再送をしない、書き出しが画面と同じで合言葉を含まない、シート用の10列の崩れ。
- E2E（モック）：参加URLの鍵→質問→回答→記事カード→コピーの中身が画面と一致。

### 7. G5 WordPressの表示・停止フラグ

- WP側`/wp-json/v1/sayo-chat-status`（`katsumascore_wordpress_theme`）と、Nextの`/api/sayo-chat-status`（30秒キャッシュ）。取得に失敗したら出さない。`SayoStatus`の型とモックはある。
- WP側は別リポジトリ（`katsumascore_wordpress_theme`、`feature/*`ブランチ）。

### 8. G8 TOP・リストへの組み込み

- `HomeTemplate`・`ListTemplate`で、`SayoGate`の内側からカードに`SayoCardAction`を渡し、入口（`SayoEntry`）を置く。`ja`だけ。
- ページ本体のISR・キャッシュを変えない。`SayoGate`・`SayoCardAction`・`SayoEntry`は作ってある。

### 9. G10 本番での疎通確認（最後）

- 手順書5章のV1〜V8を、TOP・リストで確かめる。
- 前提：フロントのデプロイ、ai-chatのAPI追加の本番反映、承認済み要約のデータが本番の索引にあること、参加専用ページ`/api/chat/join`が本番にあること。どれかが欠けるとV3と要約・候補を確かめられない。
- V7（間違った鍵）は、IPの失敗回数が増える（1日10回で締め出し）ので1〜2回にとどめる。

## 進め方の目安

1. G2・G4・G6（型と呼び出しとモックを先に揃える）
2. G3・G7・G9（モックで動かして試験する）
3. G5・G8（組み込み。WP側は別PR）
4. G10（ai-chatの本番反映のあと）

ai-chat側の実装が終わるまで、G1〜G9はモックで進められる。ai-chat側のAPIの形（Schema）が決まったら、G4のzodを合わせる。

## やってはいけないこと

- 合言葉・鍵をログ・ストレージ・解析ツール・URLに残さない。
- `src/pages/api/chat`を作らない。middlewareを作らない。
- `/health.enabled`だけで要約・候補を止めない。
- 自動の再送・再試行をしない。
- ページ本体のISR・キャッシュを変えない。
- 人格・得意分野などの内部情報を表示や書き出しに出さない。
