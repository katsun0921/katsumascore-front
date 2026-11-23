# 開発者ツール（ローカル確認用 Box）

> 2026-11-23 作成。状態：開発中（箱の基盤とサヨ用パネルまで実装。API疎通確認は選択肢だけ出して無効にし、G10で有効にする。9章）。
> 関連：[`sayo_chat_todo.md`](sayo_chat_todo.md)（G2・G4・G6・G8）、[`sayo_chat_front_guide.md`](sayo_chat_front_guide.md)（4章：ローカルでの確認）。

## 1. 目的

ai-chat は、1回の要約・候補・会話ごとに回数と費用（LLM）がかかる。画面の確認のたびに実際のリクエストが走ると、料金がかさむ。そこで、**ローカルで画面を確認するときは、ai-chat へ通信せず、あらかじめ決めた返答（mock）を返す**。実際に ai-chat へ送る確認（API疎通確認）は、意図して選んだときだけ行う。

あわせて、画面の ABテストの比較など、ほかのローカル確認も同じ箱に足せるようにする（8章）。

## 2. 2つのモード（サヨ）

| モード | 設定値 | ai-chat へ | 料金 | 返答 | 用途 |
|---|---|---|---|---|---|
| **UI確認（既定）** | `mock` | 通信しない | かからない | シナリオ表（7章）であらかじめ決めた返答 | 画面・状態の確認。何度押してもよい |
| **API疎通確認** | `api` | 実際に送る | 回数とLLMの料金がかかる | ai-chat の応答そのまま | 契約（スキーマ）どおりに動くかの確認 |

- **既定は `mock`。** 設定が無い・壊れている・選択肢にない値のときも `mock` に戻る（誤って料金がかからない側に倒す）。
- `api` を選ぶと、パネルが赤い表示で「実際に送る・回数と料金がかかる」と出す。
- **現状 `api` は選べない**（選択肢は出すが無効。`SAYO_API_MODE_ENABLED = false`）。**G10（本番での疎通確認）で `true` にして有効にする**（2026-11-23 決定）。保存値が `api` でも、無効の間は `mock` に戻る。

## 3. 有効になる条件と、本番に出ない仕組み

- 有効になるのは **`NODE_ENV === 'development'`（`next dev`・Storybook の dev）のときだけ。**
- `_app.tsx` が、開発サーバーのときだけ `next/dynamic`（`ssr: false`）で箱を読み込む。本番ビルドでは、この分岐が消え、箱の import も残らない設計。
- 設定ストア（5章）も、無効のときは保存値を**読まず・書かず**、常に既定値を返す。箱のコードが万一混ざっても、本番では設定が効かない。
- `resolveSayoClient` は、無効のときは設定にかかわらず**常に本番の `SayoClient`** を返す。

## 4. 使い方

1. `npm run dev` で開発サーバーを起動する。画面の左下に「DEV」ボタンが出る。
2. 開いて「サヨ」のタブを選ぶ。データ源（UI確認／API疎通確認）と、UI確認のシナリオ（プルダウン）を選ぶ。
3. 値を変えると、**ページを再読み込みして反映する**（取得済みの画面状態・残り回数・要約キャッシュを引きずらないため）。
4. 設定はブラウザの `localStorage`（キー `katsumascore:devtools`）に保存される。「サヨの設定を初期値に戻す」で消せる。
5. Esc または ✕ で閉じる。

> サヨの画面を使うページ（TOP・リストへの組み込み＝G8）がまだ無いので、**いまは、この設定が効く画面が無い**（箱の表示・設定の保存までが動く）。Storybook の `SayoStoryFrame` は設定を読まず、各Storyの引数で状態を作る。組み込み後は、`SayoProvider` の `client` に `useSayoClient(apiClient)` の戻り値を渡すだけで、この設定が反映される。

## 5. 構成

```
src/
├── pages/_app.tsx                          開発サーバーのときだけ DevToolsBox を動的に読み込む
├── types/devtools.ts                       DevToolsPanelDef（パネルの型）
├── libs/devtools/
│   ├── devToolsStore.ts                    設定ストア（localStorage・有効/無効・購読）
│   └── index.ts
├── hooks/useDevChoice.ts                   「選択肢から1つ選ぶ設定」を読み書きする hook
└── components/features/
    ├── devtools/
    │   ├── DevToolsBox/                    箱本体（DEVボタン・タブ）。パネルの一覧は DevToolsBox.config.ts
    │   ├── DevToolsChoice/                 選択肢を選ぶ部品（ラジオ／プルダウン）。全パネルで使い回す
    │   └── SayoDevPanel/                   サヨ用パネル（データ源・シナリオ）
    └── sayo/
        ├── mocks/sayoMockScenarios.ts      UI確認シナリオ表・設定キー・データ源の定義
        ├── mocks/sayoMockClient.ts         シナリオの条件で応答する架空の SayoClient
        └── useSayoClient/                  設定に従って SayoClient を選ぶ（resolveSayoClient・useSayoClient）
```

| 部分 | 責務 |
|---|---|
| `devToolsStore` | キー→値（文字列）を保存・取得。`getChoice` は選択肢にない値を既定値に戻す。`subscribe` で変更を通知、`refresh` で別タブの変更を取り込む |
| `useDevChoice(key, allowed, fallback, { reload })` | パネルの設定項目を読み書きする。`useSyncExternalStore` を使い、サーバー描画・ハイドレーション中は既定値を返す。変更時は既定で再読み込み |
| `DevToolsBox` | 画面の隅のボタンと、パネルのタブ。**機能は知らない**（一覧から描くだけ） |
| `DevToolsChoice` | 設定項目の見た目（ラジオ／プルダウン、選べない理由、選んだ項目の説明）。機能は知らない |
| `SayoDevPanel` | サヨの設定項目を `DevToolsChoice` で並べる |
| `resolveSayoClient` | 本番＝本番のクライアント。開発サーバー＝設定に従う（既定 mock。`api` は本番クライアントが使えるときだけ） |

## 6. 設定ストアの仕様

- 保存先：`localStorage` の `katsumascore:devtools`（JSON。文字列→文字列の辞書）。
- 形が違う保存値（壊れた JSON・配列・文字列以外の値）は捨てて既定値に戻す。
- 保存先が使えない（権限なし・SSR）ときも例外にしない。そのページを開いている間は、メモリの値で動く。
- **秘密値（合言葉・鍵・トークン）は保存しない。**
- 設定キーは機能ごとに名前空間を付ける。

| キー | 値 | 既定 | 定義場所 |
|---|---|---|---|
| `sayo.dataSource` | `mock` ／ `api` | `mock` | `sayoMockScenarios.ts` |
| `sayo.scenario` | 7章のシナリオID | `normal` | `sayoMockScenarios.ts` |

## 7. サヨのUI確認シナリオ

UI確認（`mock`）のとき、プルダウンで選ぶ。`sayoMockScenarios.ts` の表が正（この表はそこから書き出した）。シナリオを足すときは、その表に1行足すだけでよい（パネルの変更は要らない）。

| シナリオID | 名前 | 確かめること |
|---|---|---|
| `normal` | 通常 | 参加済み・残り30回。要約・候補・会話がそろって返る |
| `notJoined` | 未参加 | GET /session が joined: false。要約・候補が無効になり、案内文が出る |
| `sessionError` | 参加確認の失敗 | GET /session の通信失敗・503。未参加と同じ表示になる |
| `lastOne` | 残り1回 | 次の取得で残り0回になる。0回の直後の表示を確かめる |
| `limitReached` | 残り0回 | 回数を数える操作がすべて止まり、明日の案内が出る |
| `paused` | 停止中（WP） | WordPress の停止フラグ ON。自由入力だけ止まり、要約・候補は使える |
| `closed` | 受付終了（health） | health.enabled: false。自由入力だけ止まる |
| `hidden` | 非表示（WP） | WordPress の表示フラグ OFF。サヨのUIが何も出ない |
| `statusError` | 表示フラグの取得失敗 | WordPress フラグの取得に失敗。出さない側に倒れる |
| `slow` | 遅い応答 | 応答に数秒かかる。考え中の表示・二重送信の防止を確かめる |
| `noMatch` | no_match | 会話が no_match（記事に該当なし）。表情は sorry |
| `tooLong` | too_long | 会話が too_long（200字超） |
| `limitUser` | limit_user | 会話が 429 limit_user。残り0回になる |
| `limitGlobal` | limit_global | 会話が 429 limit_global。サイト全体の上限 |
| `sessionExpired` | session_expired | 会話が session_expired。参加URLの開き直しを案内する |
| `disabled` | disabled | 会話が 503 disabled。受付停止 |
| `error` | error | 会話が error。自動で再送しない |

「会話が○○」のシナリオは、会話（`/message`）の `status` を強制し、表情は `sorry` を返す。通常の返事の表情は、mock も ai-chat と同じく**サーバー側の値**として返す（記事あり→`recommend`、ネタバレ→`secret`、記事なし→`default`）。

## 8. 拡張のしかた

機能を足すとき（例：画面の ABテスト）は、箱本体を変えずに、次の2つだけ行う。

1. パネルのコンポーネントを作る（`features/devtools/<名前>DevPanel/`）。設定項目は `DevToolsChoice` と `useDevChoice` で作る。
2. `DevToolsBox.config.ts` の一覧に1行足す。

ABテストの例（TOPのレイアウトを案A・案Bで見比べる）：

```tsx
// パネル：features/devtools/AbDevPanel/AbDevPanel.tsx
const [layout, setLayout] = useDevChoice('ab.homeLayout', ['a', 'b'] as const, 'a');
// ... <DevToolsChoice legend='TOPのレイアウト' name='ab-home' value={layout} options={...} onChange={setLayout} />

// 画面側：同じキーを読んで出し分ける
const [layout] = useDevChoice('ab.homeLayout', ['a', 'b'] as const, 'a');
```

- 本番（無効）では、`useDevChoice` は常に既定値（`a`）を返すので、本番の画面は案Aのまま変わらない。
- 再読み込みなしで切り替えられる設定は、`{ reload: false }` を渡す。
- ここでの ABテストは、**ローカルで案を見比べるためのもの**。本番でアクセスを振り分ける ABテストの仕組みとは別。

## 9. 制約・未決

1. **APIモードは、箱に入れたまま無効にし、G10で有効にする（2026-11-23 決定）。** 有効にする前に、ローカルからの経路を決める必要がある。ai-chat は `Origin` が一致しない `fetch` を 403 で返す（手順書 2.2・4.1）。ローカルの `next dev`（`localhost:3000`）からは、`rewrites` で中継しても `Origin` がそのまま転送され、届かない。一方、この箱は本番ビルドに出ないので、デプロイ先のページでは使えない。G10で有効にするときに、次のいずれかを選ぶ：
   - A. 開発サーバー専用の中継で、ai-chat へ送るときの `Origin` を合わせる（ai-chat の dev 入口は Cloudflare Access で守られており、別途の通し方が要る。`src/pages/api/chat` を作らない規約との整理も必要）。
   - B. 本番とは別のデプロイ（ステージング）に、明示した環境変数のときだけ箱を出す。
   - C. 箱ではAPI疎通確認をやらず、本番反映後の手順（手順書5章 V1〜V8）に任せる。その場合、箱の `api` は外す。
   有効にする手順：`SAYO_API_MODE_ENABLED` を `true` にする（`sayoMockScenarios.ts`）。前提は、本番の `SayoClient`（G4）ができていること。
2. **G10 の Todo に「開発者ツールのAPIモードを有効にする」を足す。** `sayo_chat_todo.md` のG10は、#307 で書き直し中のため、そのPRがマージされたあとに足す。
3. **本番ビルドへの混入は未検証。** `resolveSayoClient` が mock クライアントとデータを静的に import しているため、本番の bundle から落ちるかは、ビルドして確かめていない。G6 で、動的 import にするか、ビルド成果物で確認する。
4. 設定を変えるたびに再読み込みする。再読み込みなしの反映は、サヨの画面状態（残り回数・モーダル・要約キャッシュ）の持ち越しが難しいため、見送っている。

## 10. テスト・確認

- ユニット：`npm run test:devtools`（`tests/unit/devtools.test.ts`。CI の `ui-test.yml` でも実行）
  - 設定ストア：無効のとき保存値を読まず・書かない／保存と復元／選択肢にない値・壊れた値／保存先の例外／reset／購読と refresh
  - クライアント選択：本番は常に本番のクライアント／開発の既定は mock／`api` 保存でも未実装の間は mock／シナリオが応答に反映／未知のシナリオは `normal`
  - シナリオ：会話の `status` を強制するものが、その `status` と表情 `sorry` を返す／通常の返事の表情はサーバー側の値
- Storybook：`Features/DevTools/DevToolsBox`・`DevToolsChoice`・`SayoDevPanel`
- 実機：`npm run dev` で、DEV ボタン → シナリオ選択 → 再読み込み後も選択が残ること

## 11. 関連

- [`sayo_chat_todo.md`](sayo_chat_todo.md) — G2（参加確認・表情）、G4（本番 `SayoClient`）、G6（ローカル確認用モック）、G8（組み込み）
- [`sayo_chat_front_guide.md`](sayo_chat_front_guide.md) — 4章（ローカルでの確認）、2.2（Origin の条件）、5章（本番での疎通確認）
- [`FEATURE_LIST.md`](../FEATURE_LIST.md)
