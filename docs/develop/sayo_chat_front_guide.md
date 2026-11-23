# フロント実装手順書（katsumascore-front 向け）

> 正本は katsumascore-ai-chat の `docs/front-implementation-guide.md`。これは2026-11-23時点の写し。食い違ったら正本を優先する。相対リンクはai-chatのリポジトリを指す。

2026-11-22作成。ステータス：**引き渡し用の初版**（J1〜J4は決定済み。2026-11-23にJ1を案Gへ変更、1.1）。`katsumascore-front`（Next.js・Pages Router）に、サヨとの会話画面を足すための手順書。実装するのは`katsumascore-front`の側で、この文書は`katsumascore-ai-chat`の側にある**API契約の要約と、実装の順番・受け入れ条件**を渡すためのもの。

契約の正は、次の2つ。食い違ったら、これらを優先する。
- [`schema/api.schema.json`](https://github.com/katsun0921/katsumascore-ai-chat/blob/main/schema/api.schema.json)・[`schema/avatar.schema.json`](../schema/avatar.schema.json)・[`schema/article.schema.json`](../schema/article.schema.json)
- `test/api/*.json`（応答の例。`message-response.json`・`session-response.json`・`avatars-response.json`・`health-response.json`）

秘密値（合言葉・`CF_AIG_TOKEN`など）、テスターの連絡先・人数は、コード・テスト・ドキュメント・コミットに書かない。

## 0. 目的と範囲

**目的**：いまテスターが`curl`で行っている会話（[テスター向け手順](https://github.com/katsun0921/katsumascore-ai-chat/blob/main/docs/tester-guide.md)）を、ブラウザの画面で行えるようにする。

**範囲（この手順書でやること）**
- 限定公開（合言葉＋sid）用の会話画面。合言葉の入力、質問の送信、回答・記事カード・表情の表示。
- **画面に、質問と回答を、1往復ずつ並べて表示する**（会話ログ）。さらに、**画面に表示された内容のとおりに、質問と回答を書き出せる**（2.6。スプレッドシートに貼れる形と、読みやすい文の形）。テスターの報告と、運用の確認に使う。サーバーには何も足さない。
- APIクライアント、状態管理、テスト、Storybook、ドキュメントの更新。

**範囲外（やらないこと）**
- Turnstile（一般公開のPhase 1bで行う。`ACCESS_MODE=public`の切り替えと同時）。
- 会話履歴の保存・復元（サーバーが直近3往復・24時間を持つ。会話本文をフロントに保存しない）。画面の会話ログは、ページを開いているあいだだけ**メモリ**に持つ。再読み込みで消える。
- 会話本文を、サーバー・解析ツール・ログへ送ること（書き出しは、利用者が押したときの、クリップボードへのコピーだけ）。
- 複数アバターの切り替え（いまはサヨだけ。`suggestAvatar`は常に`null`）。
- 正式な立ち絵（仮画像で進める。APIが返す画像URLをそのまま使う）。
- `src/pages/api/chat/*`を作ること。**本番では、`katsumascore.blog/api/chat/*`のRouteがai-chatのWorkerに先に届く**ので、フロントに同じパスを作ると、ローカルだけで動いて本番で届かない食い違いが生まれる。

## 1. 決定事項（J1〜J4）

2026-11-22に、利用者が決定した（いずれも、当初の仮の案のとおり）。

| # | 項目 | 決定 | 理由 |
|---|---|---|---|
| J1 | 画面の置き場所 | ~~専用ページ`/ja/chat`（`noindex`、ナビ・サイトマップに載せない）~~ → **2026-11-23に変更：案G**（下の1.1） | 当初は、合言葉を知る人だけが使い、ほかの画面に影響しないため。変更の理由は1.1 |
| J2 | 英語（`/en/chat`） | 作らない | 索引は日本語の記事だけで、会話評価も日本語だけ |
| J3 | 合言葉の入れ方 | ~~画面の入力欄で入れ、メモリだけに持つ~~ → **2026-11-23に変更**：入力欄なし。参加URL（`/api/chat/join#key=…`）のページで「参加する」を押すと、ブラウザが既存の`POST /api/chat/session`を呼ぶ（案C。1.1） | Cookieが24時間有効なので、毎回の入力は要らない。鍵はフラグメントに置き、サーバーにもフロントにも送らない |
| J4 | 一般公開のときの画面 | Phase 1bで、この画面を作り直す | 免責・プライバシーの表示、Turnstileが要る。今回の画面は限定公開用と割り切る |

### 1.1 案Gの採用（2026-11-23、利用者決定）

UIデザインのPR（[katsumascore-front #298](https://github.com/katsun0921/katsumascore-front/pull/298)）の**案G**に合わせる。仕様の正は、フロントの`docs/develop/sayo_chat_spec.md`。
- 置き場所：TOP（`HomeTemplate`）とカテゴリのリスト（`ListTemplate`）。カードの「要約」と「何を観ようか迷ったら」の入口から要約モーダルを開き、「詳しく知りたい」でノベル風の全画面に切り替える。ページ本体（ISR）は変えず、サヨの部分はCSRで描く。`ja`だけ（J2は変わらない）。
- 表示：WordPressの表示・停止フラグ（Nextの`/api/sayo-chat-status`経由）で出し分ける。
- 本書の次の記述は、`/ja/chat`の専用ページを前提にしている。案Gでは読み替える：F5（`src/pages/chat.tsx`・`noindex`）→ TOP・リストのテンプレートへの組み込み、6章の「`/chat`は静的ページにする」→ ページ本体のISR・キャッシュを変えない、V1・V8 → TOP・リストで確かめる。
- 変わらないこと：限定公開は合言葉＋sid（`/session`でCookieを受け取ってから`/message`）。J3（合言葉は入力欄で入れ、メモリだけ）、2.2〜2.6の契約・書き出し、6章の注意。

**合言葉の入口（2026-11-23、利用者決定。J3を変更）**
- 画面に合言葉の入力欄は**出さない**。テスターに渡す参加URL（`https://katsumascore.blog/api/chat/join#key=<合言葉をURLエンコード>`）を開くと、ai-chatの参加専用ページ（下）が開く。鍵はフラグメント（`#`以降）に置くので、サーバーへ送られない。「参加する」を押すと、ページがブラウザから既存の`POST /api/chat/session`を呼び、Cookie（`Path=/api/chat`）をWorkerが直接設定する。合言葉の照合・Cookieの署名は、これまでどおりWorker側（`CHAT_BETA_KEY`）。フロントは合言葉を持たず、保存もしない。**フロントのmiddlewareは作らない。**
- **参加URLから`/session`を呼ぶ経路（2026-11-23、利用者決定：案C）**：現行のWorkerは`katsumascore.blog/api/chat/*`のルート（`wrangler.jsonc`。dev用は`dev-chat.katsumascore.blog/api/chat/*`）で動く。同じゾーンのWorkerから同じゾーンのURLを`fetch`しても別Workerのルートには入らない（Cloudflareの仕様）ので、フロントのmiddlewareから呼ぶ案は採らない。`/session`は、認証の失敗回数（照合前に加算）と初回の残り回数の計算に、`CF-Connecting-IP`（`hash_ip`を通す）を使う。ブラウザから直接呼べば、これは利用者のIPになる。
  - 採らなかった案：**A** middlewareから`/session`を呼ぶ（Service Binding。返った`Set-Cookie`の付け直しと、ai-chatが受け取るIPがフロントWorkerの転送方法に依存する点の確認が要る）、**B** フロントの画面が`?key=`を外して`/session`を呼ぶ（最初のGETでフロントのアクセスログ・解析タグに鍵が載りうる）、**D** 専用Custom Domain（Aと同じ課題に加え、公開ホストと認証入口の管理が増える。middlewareを使うならService Bindingを優先する）。
  - **参加専用ページ`GET /api/chat/join`の仕様**（ai-chatに足す。JSON契約の外のHTMLなので、Schemaは変えない。試験は`test/api`に足す）：
    - 応答：固定のHTML（200）。状態を持たず、Cookieの検証・DO・alarmに触らない。`Set-Cookie`を付けない。`HEAD`も同じ。
    - ヘッダー：`Cache-Control: no-store`、`Referrer-Policy: no-referrer`、`X-Content-Type-Options: nosniff`、`X-Robots-Tag: noindex`、`Content-Security-Policy: default-src 'none'; script-src 'nonce-…'; style-src 'nonce-…'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`（nonceは、リクエストごとに生成）。
    - 外部の読み込み・解析タグ・フォント・画像を持たない（HTMLだけで完結）。フロントのレイアウトも使わない。
    - 動き：読み込み後すぐ、`location.hash`から`key`を読み、メモリの変数にだけ持ち、`history.replaceState`でURLからフラグメントを消す（`console`・`sessionStorage`・`localStorage`に出さない）。鍵がなければ、`POST`せず「参加URLが正しくありません」と出す。
    - 「参加する」ボタンを押したときだけ、`POST /api/chat/session`（`{"betaKey": 鍵}`、同一オリジン、`credentials`は既定）を1回呼ぶ。送信中はボタンを無効にする。リンクの先読み（チャット・SNSのプレビュー）では、ボタンが押されないので認証は始まらない。
    - 結果：200なら`location.replace('/ja')`（行き先は固定。`next`のような引数は受け取らない＝オープンリダイレクトを作らない）。それ以外（403・503・通信の失敗）は、理由を区別せず「参加できませんでした。参加URLをもう一度確かめてください」と出す（`session_expired`は理由を区別しない仕様）。自動の再試行はしない。
    - 失敗回数：鍵が空・無いときは数えない。鍵があれば、照合の前に、IP単位（`hash_ip`）の日次の試行を1件確保し（`authAttempt`。JST日付。上限`BETA_KEY_DAILY_FAILURES`＝10）、**照合に成功したら解放する**（`authRelease`）。つまり、残るのは失敗の分だけで、成功は数えない。上限に達したIPは、合っている鍵でも同じ403（`session_expired`）になる。案内文に「何度も試さない」を足す。
    - 試験（`test/api`）：200・上のヘッダーが付く・本文に`https://`の外部URLと鍵（`key`の値）が入らない・`Set-Cookie`が付かない・nonceが毎回変わる・`/session`の成功時に`/ja`へ移る処理がHTMLに含まれる。
  - 参加後の判定は、回数を消費しない`GET /api/chat/session`（下）で行う。TOP・リストの表示時に、参加状態と残り回数を取得し、要約・検索・会話の各APIは署名付きCookieを検証する。
- **参加済みかどうかの判定**：Cookie（`ks_chat`）は`HttpOnly`・`Path=/api/chat`なので、ページ（`/`など）へのリクエストにも、JavaScriptにも見えない。そこで**ai-chatに、Cookieの検証だけをする読み取りAPIを足す**。足すときはSchemaと`test/api`を先に更新する。
  - **`GET /api/chat/session`の契約**：参加済みなら`{"joined": true, "remaining": 数}`、そうでなければ`{"joined": false}`（どちらも200。Cookieが無い・署名違い・期限切れ・モード違い・保存済みセッションと不一致を、理由を区別せず`joined: false`にする）。設定の不正・IPが取れない・取得の失敗は、`joined: false`にせず503（`{"joined": false}`は返さず、既存の`error`の形）にする。画面は、どちらも参加していない扱いで、ボタンを無効にして案内文を出す（理由を断定しない）。
  - **キャッシュさせない**：応答に`Cache-Control: no-store`と`Vary: Cookie`を付け、`Set-Cookie`は付けない。フロントの`fetch`も`cache: 'no-store'`にする。参加直後・期限切れ直後・回数を使ったあとの再読み込みで、古い参加状態と残り回数が出るのを防ぐ（`/health`のキャッシュ対応と同じ考え方）。画面は、入口の表示時と再読み込み時にこれを呼ぶ。
  - **読み取り専用の残り回数（`remaining`）**：現行の`remaining`操作（`src/domain/limiter.py`）は、`run`の中で期限処理（`sweep`）を先に行うので、期限切れの予約・セッションを消す書き込みと、alarmの更新が起こりうる。AGENTS.mdの「読み取りだけの操作で書き込みやalarm更新をしていないか」に合わせ、`GET /session`には**書き込まない専用の操作**を足す：(1) セッションの確認（`peekSession`）：保存済みのセッションが署名済みCookieと一致し、`expires`が現在より後であること。(2) 残り回数（`peekRemaining`）：JSTの当日について、確定済みの数と、`expires`が現在より後の`reserved`の数だけを数える（期限切れで未処理の`reserved`は数えない。`sweep`が後で`cancelled`にする行と結果を合わせる）。利用者側（`user:sid:{sid}`）とIP側（`ip:{hash_ip}`）の少ないほうを返す（`POST /session`と同じ）。どちらも`sweep`・`changed`・alarmの更新をしない。
  - **回数を数えない・失敗回数に触れない**：`reserve`・`auth_attempt`を呼ばない（総当たりの入口にならない）。
  - **試験（`test/api`・`test/unit`）**：参加済み・Cookie無し・改ざん・期限切れ・モード違い・保存済みと不一致、`remaining`が上限ちょうど（0）、期限切れの`reserved`を含む状態、JSTの日付またぎ、呼んだあとにDOの行とalarmが変わらないこと、`Cache-Control`・`Vary`が付き`Set-Cookie`が付かないこと、応答に人格・内部の値が出ないこと。
- **期限切れ（`session_expired`）のあとの手順**：入力欄がないので、画面内での再入力・自動の再送はしない。案内文で「参加URLをもう一度開いてください」と出し、ボタンを無効にする（参加URLを開き直し、「参加する」を押す）。参加URLを開き直すとページが読み込み直され、メモリ上の会話・質問は消える（保存しない方針は変えない）ので、案内文に「会話の書き出しは先に済ませる」を足す。開き直したあとの質問は、利用者が入れ直す（送り直しは1回もしない）。
- 鍵のないアクセス（Cookieが無い・期限切れ）では、要約・候補ボタン・「詳しく知りたい」を**無効（disabled）**にし、案内文を出す。**要約・候補・会話のAPIは呼ばない**。行う通信は、入口の表示時・再読み込み時の参加確認`GET /api/chat/session`（回数を数えず、書き込まない。上）だけ。通信の失敗・503も、参加していない扱いで同じ表示にする。
- 守ること：鍵は、参加専用ページの中でだけ扱い、フラグメントをすぐURLから消す（履歴・共有に残さない）。鍵をログ・例外・解析ツールに出さない。参加URLは別の経路でテスターへ渡す（シートのURLとは別。チャットの履歴に残る点に注意し、渡したあとの扱いをテスターに伝える）。`/session`の失敗は理由を区別しない（403の`session_expired`）ので、案内文も理由を断定しない。
- 6章の「合言葉をURLに保存しない」は、「URLの鍵は、参加専用ページがフラグメントに受けて、すぐ消す。画面・ストレージ・ログには残さない」と読み替える。V3・V7は、画面の入力欄ではなく参加URLで確かめる（間違った鍵でも、失敗回数は増える）。2.4の`session_expired`の行、F3・F7の「合言葉の入力」「同じ質問を1回だけ送り直す」、2.6の「入力欄へ戻したもの」は、上の「期限切れのあとの手順」に読み替える（再送はしない）。

**未決（[判断]）**
- ai-chatに足すAPI（フロント仕様§8）：Cookieの検証だけをする`GET /api/chat/session`（上の「参加済みかどうかの判定」）、承認済み要約`POST /api/chat/articles/{id}/summary`、気分タグ・カテゴリで記事を返す`POST`のAPI、`MessageRequest`の`articleId`。足すときは、Schemaと`test/api`の例を先に更新する。要約・候補ボタンは、合言葉なしでは使えない（上）ので、Cookie（sid）を要求する。**要約・候補の回数の数え方は決定済み（下）。**

**要約・候補の回数の数え方（2026-11-23、利用者決定）**
- **API**：要約・候補は`POST`。署名付きCookieと`requestId`（フロントが発行）が必須。sid枠・IP枠の`reserve`・`commit`・`cancel`を共用し、通信の再試行は同じ`requestId`で二重に数えない。同じ`requestId`を別の記事・検索条件に使ったら拒否する。成功応答に`remaining`（確定後のsid枠とIP枠の小さいほう）を必ず含める。
- **1回の数え方**：要約は、新たに取得して成功するたびに1回。画面を開いている間は取得済みを再利用し、閉じて開き直す・再読み込みで取り直したら、同じ記事でも1回。候補は、押して取得に成功するたびに1回（同じ気分タグ・カテゴリの押し直しも数える。取得済みの再表示は0回）。「詳しく知りたい」の画面遷移は0回（取得済みを引き継ぐ）。ノベル内の自由入力は既存の`/message`で、成功1往復につき1回。承認済み要約なし・候補0件・サーバーの失敗は0回（予約済みなら取り消す）。
- **上限**：残り1で成功したら`remaining: 0`。残り0での新規取得は`429 limit_user`。別の`requestId`で2件が同時に届いても、成功は1件だけ（試験）。要約・候補・会話は、全アバター合算でsidあたり30回・IPあたり60回/JST日の共通枠。どちらの枠に達しても`429 limit_user`。
- **受付停止と予算**：`CHAT_ENABLED=false`または`RESERVATION_LIMITS_VERIFIED=false`の間は、要約・候補・会話の新規受付を`503 disabled`で止める（既存予約の解放・精算は続ける）。LLMの日次予算切れだけなら、枠に空きがある限り要約・候補は受け、会話は`429 limit_global`。フロントは`/health.enabled`だけで要約・候補を止めず、APIの応答に合わせる。要約・候補はLLMを使わないので、全体予算の予約・計上はしない（sid枠・IP枠だけ）。
- **集計と保管**：日次上限は合算。依頼金額の算出には、sid側の確定分をJST日付ごとに種類別（要約・候補・会話）で集計する。集計に会話本文・生IPは含めない。D1の日次集計は**期限付き**で保管する（永続保存はしない）。**具体的な保存期間と削除のタイミングは未決（[判断]）**。決まるまで、依頼文・同意の条件の文面に保存期間を書かない（書く内容が決まってから、保存対象・保存期間・削除のタイミングを伝え、事前に同意した人だけをテスターに採用する）。
- **保管先（2026-11-23、利用者決定）**：D1。DOの`sweep`の対象外だが、期限付き（上）。確定のあとに行を1件書く後追い書き込み（失敗しても利用回数の確定は取り消さない）。
- **二重計上の防止**：行の一意キーは`(sid, request_id)`とする。`day`と`kind`は、**最初に確定した行の値**を使い、再送では変えない（再送時の日付・種類で新しい行を作らない）。23:59に書き込みが成功して結果を受け取れず、00:01に再送されても、同じ`(sid, request_id)`は既存の行を残して無視する（日付は23:59のまま）。同じ`(sid, request_id)`で`kind`が違う再送は拒否する。試験：JSTの日付またぎの再送、種類違いの再送。
- **転記漏れの回復（[判断]・未決）**：要約1件がDOで確定した直後にD1への書き込みが失敗すると、利用枠は1回減るが、D1で算出する依頼金額にその1回が入らない（精算件数が利用実績を下回る）。再送（失敗した書き込みの再試行の仕組み）か、照合（DOの確定行とD1の突き合わせ）かを、実装の前に決める。DOの確定行は24時間で消えるので、照合なら、その期限内に行う必要がある。
- **残る判断**：sidは参加のたびに変わるので、テスターごとの金額の算出には、sidとテスターの結びつけ（テスターごとに参加URLの鍵を分けて識別子を記録する／自己申告と照合する）を決める。

**#298で直すこと**
- 表情：`MessageResponse`の`expression`（2.3）を使う。待ちの`thinking`だけ画面で決める（フロント仕様の「APIは表情を返さない」は誤り）。
- 会話ログの書き出し（2.6）を加える。テスターのシートへの記入に要る。
- 合言葉の入力欄は作らない。middlewareも作らない（鍵はai-chatの参加専用ページが受ける）。`GET /session`で参加済みかを確かめ、参加していないときの無効表示（案内文）を加える。

## 2. APIの要約

ホストは`https://katsumascore.blog`だけ（`www`は使わない）。**同一オリジンの`fetch`だけが通る**（下の2.2）。

### 2.1 エンドポイント

| HTTP | パス | 用途 | 備考 |
|---|---|---|---|
| GET | `/api/chat/health` | 受付の状態 | `{"enabled": boolean, "mode": "restricted" \| "public"}`。`enabled`は、`CHAT_ENABLED`と日次予算の空きの両方で決まる |
| GET | `/api/chat/avatars` | アバターの一覧 | `PublicAvatar`の配列。`images`は、画像のパス（`/api/chat/assets/sayo/default.webp`など）。5つの表情のキーが揃っている |
| GET | `/api/chat/assets/{id}/{expression}.webp` | 立ち絵 | `expression`は`default`・`thinking`・`recommend`・`sorry`・`secret` |
| POST | `/api/chat/session` | 合言葉を確かめて、Cookieを設定 | 本文：`{"betaKey": "..."}`。成功：`{"ok": true, "remaining": 数, "greetings": {"sayo": "..."}}` |
| POST | `/api/chat/message` | 1往復の質問 | 本文：`{"avatarId": "sayo", "message": "..."}`。応答は`MessageResponse` |

### 2.2 守ること（通らなくなる条件）

`/session`と`/message`は、次を**すべて**満たすPOSTだけを通す（[src/security/session.py](../src/security/session.py)の`same_origin_json`）。
- `Content-Type: application/json`
- `Origin`が、リクエスト先のオリジンと完全に一致する（ブラウザが、同一オリジンの`fetch`で自動で付ける）
- `Sec-Fetch-Site`が`cross-site`でも`same-site`でもない（`same-origin`）

そのため、**フロントのページから、相対パス（`/api/chat/...`）で`fetch`する**。別のホスト・`www`・プロキシ・`no-cors`・フォーム送信は通らない。

Cookie（`ks_chat`）は、`HttpOnly; Secure; SameSite=Lax; Path=/api/chat`で、24時間有効。**JavaScriptからは読めない**ので、「ログイン済みか」はフロントでは分からない。`/message`が`session_expired`を返したら、参加URLの開き直しを案内する（1.1）。`fetch`は、同一オリジンなら、Cookieを既定で送る（`credentials`を変えない）。

### 2.3 応答の型（`MessageResponse`）

`/message`は、成功も失敗も**同じ形のJSON**を返す。HTTPのコードが200でなくても、本文を読む。

| 項目 | 型 | 意味 |
|---|---|---|
| `status` | 列挙 | 下の2.4 |
| `avatarId` | 文字列 | 失敗の一部では空文字 |
| `reply` | 文字列 | サヨの回答。**プレーンテキスト**（HTMLとして描画しない。URLは書かれない） |
| `articles` | 配列（最大3） | 記事カード。`id`・`title`・`url`・`thumbnail`・`category`・`katsumaScore`・`vod`（配信サービスの配列）・`vodCheckedAt` |
| `suggestAvatar` | オブジェクトか`null` | いまは常に`null` |
| `spoiler` | 真偽値 | ネタバレを含む回答なら`true` |
| `remaining` | 整数 | その日（JST）に送れる残り回数 |
| `expression` | 列挙 | `default`・`recommend`・`sorry`・`secret`。サーバーが決める。`thinking`は含まれない（待ち表示は画面が使う） |

`/session`が失敗したときも、`MessageResponse`と同じ形（`status`が`session_expired`など）で返る。成功時だけ、`{ok, remaining, greetings}`の形。`/session`の失敗は、理由（合言葉違い・締め出し・Origin違い・空）を**区別しない**（403の`session_expired`）。区別できる前提で画面を作らない。

### 2.4 `status`と画面の動き

| `status`（HTTP） | 意味 | 画面の動き |
|---|---|---|
| `ok`（200） | 回答できた | 回答・記事カード・表情を表示し、`remaining`を更新 |
| `no_match`（200） | 質問に合う記事がない。AIは呼ばれず、回数も減らない | `reply`をそのまま表示（サヨの定型文）。表情は`sorry` |
| `off_topic` | 範囲外の質問 | `reply`をそのまま表示 |
| `too_long`（400） | 200字を超えた | 「200字以内」と案内。**送信前に画面でも数える**（下の注意） |
| `invalid_avatar`（400） | アバターが無効 | 一覧を取り直す。通常は起きない |
| `limit_user`（429） | その日の回数を使い切った | 送信欄を止め、「明日（日本時間0時以降）に再開」と表示 |
| `limit_global`（429） | サイト全体のその日の上限 | 同上（原因は伏せ、「今日は混み合っています」程度） |
| `session_expired`（401／403） | Cookieが無い・切れた、合言葉が違う | 参加URLの開き直しを案内し、ボタンを無効にする（1.1。入力欄はなく、自動の再送もしない） |
| `disabled`（503） | 一時停止中 | 「ただいま停止中」と表示。再試行を促さない |
| `error`（400／502／503） | 内部の失敗 | 「うまく答えられませんでした。時間をおいてもう一度」。**自動で再送しない**（再送が回数・費用を使う） |

### 2.5 入力の制約

- 質問は**200字まで**（サーバーの`MAX_INPUT_CHARS`）。数え方は文字（コードポイント）。JavaScriptでは`Array.from(text).length`で数える（`text.length`はUTF-16で、絵文字などで食い違う）。
- 空・空白だけは送らない。
- 会話履歴は送らない（リクエストに含めても使われない。サーバーが持つ）。
- 合言葉・質問・回答を、`console`・ログ・URL・クエリ・`localStorage`・`sessionStorage`・解析ツールに出さない。画面の会話ログ（メモリ）と、2.6の書き出しだけが例外。

### 2.6 会話ログの表示と書き出し

**目的**：テスターが、画面に出たとおりの質問と回答を、管理者が用意したスプレッドシートに貼って報告できるようにする（2026-11-22の利用者決定。集め方は[サヨの学習計画](sayo-learning-plan.md#集め方と決まっていること)）。運用する側は、本文を自動では見られない（会話本文は、サーバーに残さない設計）。見る手段は、テスターが書き出して貼った報告だけになる。

**画面の会話ログ**
- 送信して応答が返った往復を、上から順に並べる。1往復＝「質問の吹き出し」と「回答の吹き出し（記事カード・ネタバレの印・表情つき）」。
- `ok`・`no_match`・`off_topic`のほか、`limit_*`・`disabled`・`error`も、**応答が返ったものは往復として並べる**（`status`の案内文とともに）。不具合の報告では、この表示が要る。
- 並べないもの：送る前に画面で止めた質問（200字超・空）。`session_expired`で送れなかった質問（再送しないので、ログには並べない）。
- 保持するのはメモリだけ（`useState`）。`localStorage`・`sessionStorage`・Cookie・URLに入れない。ページを閉じる・再読み込みで消える（サーバーの履歴は、直近3往復・24時間、別に残る）。

**書き出し**
- 画面に「この回答をコピー」（1往復）と「会話をすべてコピー」を置く。**利用者がボタンを押したときだけ**、`navigator.clipboard.writeText`でクリップボードに入れる。自動で送らない・保存しない。
- 書き出しの形は2つ。ボタンの近くの切り替えで選ぶ。**シート用（初期値）**は、1往復を1行にして、スプレッドシートに貼ると列に分かれる形。**文**は、読みやすい文の形（下の例）。
- クリップボードが使えないとき（権限・古いブラウザ）は、読み取り専用の`<textarea>`に同じ内容を出し、手で選んでコピーできるようにする。
- 書き出す内容は、**画面の会話ログと同じデータ**から作る（別に組み立てない。画面と食い違わない）。どちらの形も、純粋な関数（例：`formatConversation(turns, 'sheet' | 'text')`、`src/libs/chat/`）にして、ユニットで試す。文の形（例）：

```text
サヨとの会話（画面の写し）　書き出し：2026-11-22 14:03（日本時間）
――― 1 ―――
質問（14:01）：『リング』はどんな作品ですか？
status：ok　ネタバレ：なし　残り：29
回答：（reply の全文）
記事カード：リング(1998)　ID 12　https://katsumascore.blog/ja/...
```

**シート用の形**（1往復＝1行。タブ区切り。見出し行は付けない）：

| 列 | 内容 |
|---|---|
| 1 質問時刻 | 質問を送った時刻（端末の時計、日本時間）。例：`2026-11-22 14:01` |
| 2 往復 | 画面の会話ログでの往復の番号 |
| 3 質問 | 送った質問 |
| 4 status | `ok`・`no_match`・`error`など |
| 5 ネタバレ | `spoiler`が`true`なら「あり」、そうでなければ「なし」 |
| 6 残り | `remaining`（回数） |
| 7 回答 | `reply`の全文 |
| 8 記事ID | カードの`id`。複数は`｜`（全角の縦線）でつなぐ |
| 9 記事の題名 | カードの`title`。複数は`｜` |
| 10 記事URL | カードの`url`。複数は`｜`。slugはURLの末尾 |

- セルに改行・タブ・二重引用符が入るときは、セルを二重引用符で囲み、中の二重引用符は2つにする（`reply`は改行を含みうる）。
- セルの先頭が`=`・`+`・`-`・`@`のときは、先頭に`'`を1つ付ける（シートで数式として実行されないようにする。取り込みで1つだけ外す。採点表の方式と同じ）。
- この10列は、スプレッドシートの雛形の列の順と**必ず合わせる**。雛形の前後の列（テスターID・種類・感想）は、書き出しに含めず、シートで書く。雛形が決まったら、この表を雛形に合わせて直す。
**どちらの形にも共通すること**

- 含めるもの：質問、`status`、`spoiler`、`remaining`、回答（`reply`）、記事カードのID・題名・URL、質問を送った時刻（端末の時計、日本時間）。
- **含めないもの**：合言葉、Cookie、`sid`、IP、人格・得意分野などの内部の情報（APIは返さないので、もともと入らない）。
- ボタンの近くに、「質問に個人の情報（名前・連絡先など）を書いた場合は、貼る前に消してください」と案内する。
- 書き出しの文を、`console`・解析ツールに出さない。

**報告への使い方**：テスターは、シート用の形でコピーし、自分用のシートの空いている行に貼る。貼ったあと、同じ行に「種類」「感想」を書く（記入した時点で、シート先頭の条件に同意したものとする）。「この回答をコピー」で、おかしいと感じた往復だけを取ってもよく、「会話をすべてコピー」で続きの質問を含めて取ってもよい（会話単位の評価のため、続きがあるときは後者が望ましい）。シートのURLは、テスターへ別の経路で渡し、この手順書にも書かない。現在の手順（`curl`）のあいだは、`status`とおかしいと思った一文で足りるとしている。画面ができたあとは、この書き出しを使えば、回答の全文を貼る手間がなく、質問の取り違えも防げる。

## 3. 実装の手順

`katsumascore-front`の規約（`AGENTS.md`・`CLAUDE.md`）に従う。ブランチは最新の`origin/main`から切り（mainへの直接コミット禁止）、**PRのタイトルは`feature:`の接頭辞＋日本語**、PRの本文も日本語にする。新機能なので、`docs/FEATURE_LIST.md`を同じコミットで更新する。

| 手順 | 内容 | 置き場所（案） | 受け入れ条件 |
|---|---|---|---|
| **F1** | 型とAPIクライアント | `src/types/chat.ts`、`src/libs/chat/`（日本語のJSDocを付ける） | 2章の型を、実行時に検証する（`zod`。`WPPostSchema`と同じ流儀）。応答が型に合わないときは、`error`として扱い、画面を壊さない。HTTPのコードにかかわらず本文を読む。相対パスだけを使う（絶対URLを組み立てない） |
| **F2** | 疎通用のモック | `src/libs/chat/`のモック（`NEXT_PUBLIC_CHAT_MOCK=1`のときだけ有効） | 2.4の全`status`を、固定の応答で返せる。**本番のビルドでモックが有効にならない**（環境変数が無ければ無効）。理由は、ローカルの`next dev`から実APIには届かないため（下の4.1） |
| **F3** | 状態管理（hooks） | `src/components/features/Chat/useChat.ts` | 状態：停止中／合言葉待ち／入力待ち／送信中／回数切れ。会話ログ（往復の配列。2.6）をメモリで持つ。二重送信を防ぐ。送信中は`thinking`の表情。`session_expired`で、直前の質問を保持して合言葉の入力に移り、通ったら**同じ質問を1回だけ**送り直す。合言葉はメモリだけ（`useState`）。保存しない |
| **F4** | UI部品 | `ui-parts`（表情の画像・吹き出し）、`ui-section`（記事カードの並び）、`features`（入力欄・合言葉フォーム） | 2.3の`reply`をテキストとして描画（`dangerouslySetInnerHTML`禁止）。記事カードは、`url`をそのままリンクにし、`thumbnail`・`katsumaScore`・`vod`・`vodCheckedAt`を表示。既存の`PostCard`などと**データの形が違う**ので、無理に使い回さない。表情は`images[expression]`、待ちは`images.thinking`。画像は仮画像で、右下に「仮」の印がある。**会話ログ（質問と回答の吹き出しを往復ごとに並べる）と、コピーのボタン・シート用／文の切り替え・代替の`textarea`（2.6）** |
| **F5** | 画面（Template・ページ） | `src/components/templates/`、`src/pages/chat.tsx`（`PageLayout`で包む） | `noindex`・サイトマップ除外・ナビにリンクしない。「AIの回答です」「個人情報は書かないでください」を画面に出す（Phase 1bの本番の文言とは別。仮でよい） |
| **F6** | 文言（i18n） | `src/i18n/chatPageMessages.ts`（既存の`*PageMessages.ts`と同じ形） | 日本語だけ。`ja`・`en`のキーを持つ形式に合わせ、`en`は日本語と同じ文でよい（J2の決定） |
| **F7** | テストとStorybook | `tests/unit`、`tests/e2e`、`*.stories.tsx` | 2.4の全`status`の画面を、Storybookで確認できる。クライアントの検証・200字の数え方・`session_expired`後の再送が1回だけであること、**書き出し（シート用・文の両方）が、ログと同じ内容で、合言葉などを含まないこと**、シート用の列数が10で、改行・タブ・二重引用符を含む回答や、先頭が`=`の質問でも列がずれず、数式にならないこと、をユニットで確かめる。E2Eはモックで、合言葉→質問→回答→記事カード→**「コピー」の中身が、画面と一致すること**（`clipboard`の権限を許可して読む）を通す |
| **F8** | 本番での疎通確認 | 下の5章 | 5章の項目がすべて通る |

各手順の最後に、`npm run lint`・`npm run typecheck`・（Storybookやテストがあれば）該当のテストを実行し、結果をPRに書く。実行していないものは、理由とともに明記する。

## 4. ローカルでの確認

### 4.1 ローカルの`next dev`は、実APIに届かない

`next dev`（`http://localhost:3000`）から、本番やdevのai-chatを呼ぶと、**`Origin`が一致せず403**になる。`next.config.ts`の`rewrites`でプロキシしても、ブラウザが付ける`Origin: http://localhost:3000`はそのまま転送されるため、通らない。devの入口は、さらにCloudflare Accessで守られている（[devの入口](dev-access.md)）。

したがって、ローカルではF2のモックで画面を作り、実APIとの確認は、デプロイ後の本番ページで行う（5章）。

### 4.2 モックに入れる例

`test/api/message-response.json`の例を基に、次の状態を用意する。
- 回答あり（`ok`・記事カード3件・`recommend`）、ネタバレあり（`secret`）、`no_match`、`too_long`、`limit_user`、`session_expired`、`disabled`、`error`。
- 遅い応答（送信中の表示の確認用。2〜3秒）。

## 5. 本番での疎通確認（F8）

フロントを本番にデプロイしたあとに行う。**参加URL（鍵つき）は、利用者が自分で開く。Claudeや他の人に渡さない。**

| # | 確認 | 期待 |
|---|---|---|
| V1 | `https://katsumascore.blog/ja`（TOP）とカテゴリのリストを開く | ページ本体は変わらず表示される。サヨの入口は、参加していない間は無効（案内文つき）。`/api/chat/health`が200で`enabled: true` |
| V2 | 立ち絵が表示される | `/api/chat/avatars`の`images`のURLが、すべて200の`image/webp` |
| V3 | 参加URL（`/api/chat/join#key=…`）を開き、「参加する」を押す（入力欄はない） | 開いた時点では`/session`は呼ばれない。押すと`POST /session`が200で、`/ja`へ移る。アドレスにフラグメントが残らない。Cookie（`ks_chat`）が、開発者ツールの「Application」で、`HttpOnly`・`Secure`・`Path=/api/chat`になっている |
| V3b | 再読み込み・TOPとリストの行き来 | `GET /api/chat/session`が200で`joined: true`と残り回数を返し（`no-store`、`Set-Cookie`なし）、入口が使える。通信はこの取得だけ |
| V3c | 期限切れ（Cookieを消す、または24時間後） | `GET /session`が`joined: false`。ボタンが無効になり、「参加URLをもう一度開いてください」と出る。自動の再送・再試行がない。参加URLを開いて「参加する」を押すと、また使える（会話は消えている） |
| V4 | 質問する（[テスター向け手順](https://github.com/katsun0921/katsumascore-ai-chat/blob/main/docs/tester-guide.md)の例。「『リング』はどんな作品ですか？」など） | `ok`・記事カードの表示・`remaining`の更新。表情が`recommend`に変わる |
| V5 | 該当しない質問（記事にない作品） | `no_match`。回数は減らない |
| V6 | 201字の質問 | 送信前に画面で止まる。サーバーまで届かない |
| V7 | 間違った鍵の参加URL（参加ページで「参加する」を押す） | 参加ページに「参加できませんでした。参加URLをもう一度確かめてください」を、**理由を断定せずに**表示し、`/ja`へ移らない。**この確認で、そのIPの失敗回数が増える（1日10回で締め出し。成功すると解放される）**ので、1〜2回にとどめる |
| V7b | 質問のあと、「この回答をコピー」「会話をすべてコピー」を、シート用と文の両方で押す | 質問・回答・`status`・残り回数が、画面と同じ内容で貼り付けられる。合言葉は入らない。再読み込みで、ログが消える |
| V7c | シート用でコピーし、実際のスプレッドシート（雛形）の空き行に貼る | 10列に分かれ、列の順が雛形と合う。改行を含む回答が1つのセルに入る。先頭が`=`の質問が、数式にならず文字で見える（`'`が見えないか確かめる） |
| V8 | 既存のページ | `/ja`・`/ja/search`・`/api/search`・`/robots.txt`・`/sitemap.xml`が変わらない。サイトマップに`/api/chat/join`が入らない（`noindex`）。参加ページに解析タグ・外部の読み込みがない |

確認後、利用者が結果を伝え、`katsumascore-ai-chat`側の[実装フェーズ計画](https://github.com/katsun0921/katsumascore-ai-chat/blob/main/docs/phases.md)のPhase 1cの1c-2（F1〜F8）を更新する。

## 6. 注意（やってはいけないこと）

- **自動での再送・再試行をしない。** 1回の送信ごとに、回数と費用が使われる。ネットワークの失敗で、二重に送らない。
- **合言葉を保存しない**（`localStorage`・`sessionStorage`・Cookie・URL・ログ）。
- **回答の`reply`をHTMLとして描画しない。**
- **`status`の理由を推測して表示しない。** `session_expired`は理由を区別しないのが仕様。
- **ほかの画面のキャッシュ・ISRに影響させない。** `/chat`は`getStaticProps`なしの静的ページにし、WordPressの取得を足さない。
- ブラウザの`console`で試すときも、合言葉は`prompt()`で入れ、コンソールの履歴に残さない。

## 7. 引き渡しの確認表

| 項目 | 状態 |
|---|---|
| J1〜J4の決定 | 済み（2026-11-22、利用者。上の1章）。J1は2026-11-23に案Gへ変更（1.1） |
| F1〜F8 | 着手（2026-11-23：[#298](https://github.com/katsun0921/katsumascore-front/pull/298)、2026-11-23にマージ。Storybookで部品まで。内訳は[実装フェーズ計画](https://github.com/katsun0921/katsumascore-ai-chat/blob/main/docs/phases.md)の1c-2） |
| 手順書の確認 | 利用者が確認し、フロントのセッションへ渡す（2026-11-22） |
| 手順書の置き場所 | このファイル（`katsumascore-ai-chat/docs/front-implementation-guide.md`）。フロントのセッションには、このファイルのパスを渡す |
