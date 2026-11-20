# サヨ（AI映画店主）UI 実装仕様（案G）

> 2026-11-14 作成。採用案と実装方針の正本。
> 案の比較・検討の経緯は [`docs/develop/sayo_card_ui_design.md`](sayo_card_ui_design.md)、モックは `src/ui-proposals/sayo-chat/g-summary-novel.html`。
> WordPress のフラグ API は `katsumascore_wordpress_theme/docs/feature/SAYO_CHAT_STATUS_API_SPEC.md`。

---

## 1. 決定事項（2026-11-14）

| # | 決定 | 内容 |
|---|---|---|
| 1 | **案Gを採用** | 案D（カードの「要約」・迷ったら探す入口・要約モーダル）を土台に、「詳しく知りたい」で案C（ノベル風の全画面）へ切り替える |
| 2 | **サヨの部分はCSRで実装** | TOP（ISR）・リスト（ISR）のページ本体は変えない。サヨのUIはマウント後にブラウザから取得して描く |
| 3 | **WordPress のフラグで表示を切り替える** | 「サヨを表示する」（UI全体）と「会話を止める」（LLMだけ）の2つ。CSRで読むので、ページの再生成なしに約1分で切り替わる |
| 4 | **実装はStorybookから** | 先に ui-parts・ui-section・features を Storybook で作り、見た目と状態を確かめてからページへ組み込む（§9） |

---

## 2. 対象と範囲

| 項目 | 内容 |
|---|---|
| 置くページ | TOP（`HomeTemplate`）と、カテゴリのリストページ（`ListTemplate`。例：映画） |
| 置かないページ | 記事詳細・固定ページ・検索・VOD・人物など、上記以外のすべて |
| 言語 | 初期は `ja` のみ（ai-chat の索引が `ja` の記事だけのため）。`/en` では出さない |
| 探す範囲 | TOPはすべての記事、リストはそのカテゴリの記事だけ |

---

## 3. 画面の構成と流れ

```
TOP／リスト（ISR）
 ├─ 入口「何を観ようか迷ったら」（候補ボタン・自由入力）
 │    └─ 押す → 探した結果のモーダル ──「詳しく知りたい」→ ノベル画面（探す）
 │                 └─ 作品の「要約を聞く」→ 要約モーダル
 └─ 各カード右上の「要約」
      └─ 押す → 要約モーダル（前後の作品へ送れる）──「詳しく知りたい」→ ノベル画面（作品）
```

| 画面 | 内容 | LLM | 回数 |
|---|---|---|---|
| 入口 | 顔・問いかけ・候補ボタン（気分タグ）・自由入力 | 自由入力のみ | 自由入力のみ1回 |
| 要約モーダル | 承認済み要約（書き出し・要約・こんな方に・気分タグ）、「詳しく知りたい」、前後の作品、レビューを読む | なし | 減らない |
| 探した結果のモーダル | サヨの一言・結果（最大3件、各「要約を聞く」「レビューへ」）・ほかの気分・「詳しく知りたい」 | 候補ボタンはなし | 候補ボタンは減らない |
| ノベル画面（作品） | 立ち絵・名前札つきウィンドウ・1文字ずつの返事・棚の作品・選択肢4つ・自由入力・履歴 | 選択肢と自由入力 | 1回ずつ |
| ノベル画面（探す） | 棚に結果を並べ「この作品の話を聞く」、ほかの気分で探し直す | 自由入力のみ | 自由入力のみ1回 |

- 要約モーダルには「もっと聞く」（チップ・入力欄）を置かない。会話はノベル画面に集める。
- ノベル画面の選択肢：「見どころをもう少し」「似た作品は？」「惜しいところは？」「結末を教えて（ネタバレ）」。
- ネタバレを含む返事（`spoiler: true`）は「ネタバレあり」の印と「表示する」を挟む。
- 戻り方：ノベル画面の「← 要約に戻る／結果に戻る」と Esc でモーダルへ、✕で一覧へ。

---

## 4. 表示の条件（フラグと上限）

サヨのUIは、次の順に判定して出し分ける。

| 順 | 条件 | 表示 |
|---|---|---|
| 1 | ロケールが `ja` 以外 | 出さない |
| 2 | フラグ取得中 | 出さない（出してから消すとちらつくため、場所も取らない） |
| 3 | フラグ取得に失敗 | **出さない**（公開判断のフラグなので、確認できないときは隠す側に倒す） |
| 4 | `visible: false` | 出さない |
| 5 | `paused: true` | 出す。要約・候補ボタンは使える。LLMを使う操作（自由入力・「詳しく知りたい」の質問）は送らず、案内文（WPの `message`、空なら既定文）と再開予定を出す。表情は `sorry` |
| 6 | ai-chat `/api/chat/health` が `enabled: false` | 5. と同じ表示（文は「本日の受付は終了しました」など） |
| 7 | 残り回数 0（`remaining: 0`）・`limit_*` | 5. と同じ考え方で、LLMを使う操作だけ止める |

- 5〜7でも「詳しく知りたい」ボタン自体は出す。ノベル画面は開けて、承認済み要約の読み上げまでは見られる。選択肢と入力欄の代わりに案内を出す。
- `health` は「詳しく知りたい」を押したとき、または自由入力を送る直前に読む（ページを開いただけでは読まない。ai-chat の負荷を増やさない）。

---

## 5. データの流れ（CSR）

```
ブラウザ（features/sayo の hook）
 ├─ GET /api/sayo-chat-status?lang=ja   … Next の API ルート → WP /wp-json/v1/sayo-chat-status
 ├─ GET  /api/chat/health               … ai-chat（同一オリジンの Workers ルート）
 ├─ POST /api/chat/session              … ai-chat。署名Cookie（Path=/api/chat）を受け取る
 ├─ GET  /api/chat/articles/{id}/summary … ai-chat（追加が必要、§8）
 ├─ GET  /api/chat/articles?mood=&category= … ai-chat（追加が必要、§8）
 └─ POST /api/chat/message              … ai-chat（LLM）
```

- **WordPress のフラグは Next の API ルート経由**にする（既存の `/api/high-score` と同じ流れ。WPのURLをブラウザに出さない）。API ルートは WP を `no-store` で読み、`Cache-Control: public, s-maxage=30, stale-while-revalidate=30` を付ける。WP側も30秒なので、切り替えから全員に効くまで最大でおよそ1分。
- **ai-chat はブラウザから直接**呼ぶ（Cookie が `Path=/api/chat` で同一オリジン前提のため）。
- 応答はすべて `src/libs/api/` で zod 検証してから使う。components から fetch しない（hook → libs）。
- 取得の関数は `SayoClient`（§7.4）にまとめ、Context で渡す。Storybook では架空の `SayoClient` に差し替える。

---

## 6. 状態ごとの表示

| 状態 | 表示 |
|---|---|
| 読み込み中（要約・候補ボタン） | 吹き出しに3つの点（一瞬） |
| 読み込み中（LLM） | ノベル画面の文を「（棚の前で、少し考えています……）」、表情 `thinking` |
| `ok` | 返事と作品（棚） |
| `no_match` | サヨの定型文で謝り、別の言い方を促す。表情 `sorry` |
| `too_long` | 送る前に止める（200字・文字数表示） |
| `limit_user` / `limit_global` | 入力を止め、案内を出す（§4） |
| `session_expired` | セッションを作り直す案内 |
| `disabled` | §4 の 6. と同じ |
| `error` | 「返事を受け取れませんでした」と「もう一度送る」 |
| `spoiler: true` | 「ネタバレあり」＋「表示する」 |

失敗はサヨのせりふではなく、システムの表示として出す。

表情：`default`（挨拶・カードなし）／`thinking`（待ち）／`recommend`（作品あり）／`sorry`（`ok` 以外・停止中）／`secret`（ネタバレ）。API は表情を返さないためフロントで決める。

---

## 7. コンポーネント設計

### 7.1 配置（レイヤー規約に沿って）

| 名前 | レイヤー | 役割 | スタイル |
|---|---|---|---|
| `SayoFaceButton` | `ui-parts` | カード右上の「要約」ボタン（顔＋文言）。`label`・`onClick`・`compact`（顔のみ） | Tailwind |
| `SayoBubble` | `ui-parts` | 顔・名前・吹き出し（`variant`: sayo / user） | Tailwind |
| `SayoChoice` | `ui-parts` | ノベル画面の選択肢（▶つき） | Tailwind |
| `SayoDeepButton` | `ui-parts` | 「詳しく知りたい」ボタン（立ち絵の丸・題・補足・▶） | Tailwind |
| `SayoAskBox` | `ui-section` | 入口（顔・問いかけ・候補ボタン・自由入力）。入力は非制御、`onChip`・`onSubmit` を props で受ける | SCSS |
| `SayoSummary` | `ui-section` | 要約の中身（書き出し・要約・こんな方に・気分タグ・注記） | SCSS |
| `SayoSearchResults` | `ui-section` | 探した結果の一覧（最大3件） | SCSS |
| `SayoPausedNotice` | `ui-section` | 停止中・上限の案内（文・再開予定） | SCSS |
| `SayoNovelWindow` | `ui-section` | 名前札・ネタバレ印・本文・▼（本文は props。1文字ずつの制御は features） | SCSS |
| `SayoShelf` | `ui-section` | 棚の作品カード列（「レビューを読む」「この作品の話を聞く」） | SCSS |
| `SayoProvider` | `features/sayo/` | フラグ・残り回数・モーダルとノベル画面の開閉を持つ。子孫のボタンから開けるようにする | SCSS |
| `SayoGate` | `features/sayo/` | §4 の 1〜4 を判定し、出すときだけ children を描く | — |
| `SayoCardAction` | `features/sayo/` | カードに渡す「要約」ボタン（`SayoFaceButton` を Provider につなぐ） | — |
| `SayoEntry` | `features/sayo/` | `SayoAskBox` を Provider につなぐ | — |
| `SayoSummaryModal` | `features/sayo/` | モーダル（要約／探した結果の切替、前後の作品、フォーカス管理） | SCSS |
| `SayoNovelStage` | `features/sayo/` | ノベル画面（立ち絵・表情・1文字ずつ・選択肢・入力・履歴） | SCSS |
| `useSayoStatus` | `src/hooks/` | フラグの取得（`/api/sayo-chat-status`） | — |
| `useSayoSummary` / `useSayoSearch` / `useSayoTalk` / `useTypewriter` | `features/sayo/` | 取得・会話・1文字ずつの表示 | — |
| `sayoChat.ts` | `src/libs/api/` | ai-chat の呼び出しと zod 検証 | — |
| `sayo-chat-status.ts` | `src/pages/api/` | WP フラグの中継（30秒キャッシュ） | — |
| `sayo.ts` | `src/types/` | `SayoStatus`・`SayoSummary`・`SayoArticle`・`SayoExpression` など | — |

- 1ディレクトリ1コンポーネント。全ディレクトリに `index.ts`、ルート要素に `data-component`。
- 文言は各コンポーネントの `i18n.ts`（ja / en。`/en` では出さないが、規約どおり両キーを置く）。

### 7.2 既存カードの変更（スロット）

`HomeCard`（`ui-home`）・`PostCardImgTop` / `PostCardImgLeft`（`ui-section`）はロジックを持てず、ルートが `<Link>` のため中に `<button>` を入れられない。次のように変える。

- ルートを `<div>`（相対配置）にし、その中に従来の `<Link>` と、新しい `action?: ReactNode` スロットを**兄弟として**置く。
- スロットは画像の右上（HomeCard は左上がスコア・右下がVODのため右上）に重ねる。`action` が無ければ従来と同じ見た目。
- `data-component` はルートの `<div>` に移す。
- `HomeTemplate` / `ListTemplate` は、`SayoGate` の内側で `action={<SayoCardAction postId={…} />}` を渡す。

### 7.3 色とトークン

モックの暖色（紙・木目・琥珀）とノベル画面の色を `globals.css` に追加し、`Typography.tsx` を同期する。案（名前は実装時に確定）：

| トークン | 値 | 用途 |
|---|---|---|
| `--color-sayo-paper` | `#fffaf2` | モーダルの地 |
| `--color-sayo-amber` | `#c8862e` | 名前札・ラベル・選択肢の▶ |
| `--color-sayo-amber-soft` | `#f3dfc1` | 吹き出し・タグ |
| `--color-sayo-wood` | `#5b3a24` | ボタン・タグの文字 |
| `--color-sayo-text` / `--color-sayo-sub` / `--color-sayo-line` | `#2f2219` / `#7a6656` / `#e3d4bf` | 文字・補足・罫線 |
| `--color-sayo-stage` | `#0d0907` | ノベル画面の地 |
| `--color-sayo-window-rgb` | `18, 12, 30` | ウィンドウ（透明度は `rgba()`） |
| `--color-sayo-spoiler` | `#fb7185` | ネタバレ印 |

ブレークポイントは Tailwind の `lg:`（768px）を使い、SCSS に値を直書きしない。

### 7.4 SayoClient（取得関数のまとめ）

```ts
type SayoClient = {
  getStatus: (lang: 'ja' | 'en') => Promise<SayoStatus>;          // /api/sayo-chat-status
  getHealth: () => Promise<{ enabled: boolean }>;                 // /api/chat/health
  getSummary: (articleId: number) => Promise<SayoSummary>;        // /api/chat/articles/{id}/summary
  searchByMood: (q: SayoMoodChip, category?: string) => Promise<SayoSearchResult>;
  sendMessage: (req: { message: string; articleId?: number }) => Promise<SayoMessageResult>;
};
```

本番は `src/libs/api/sayoChat.ts` の実装、Storybook は `features/sayo/mocks/` の架空実装（`card-mock.js` と同じ架空の6作品）を `SayoProvider` に渡す。

### 7.5 画像

立ち絵は ai-chat の `GET /api/chat/assets/sayo/{表情}.webp` を使う（正式な立ち絵は受領待ち。現在は「仮」1枚）。Storybook では `public/images/sayo/` に置いた仮画像を使う。`next/image` で読む。

---

## 8. ai-chat 側に必要な追加

公開JSONの変更は ai-chat の規約どおり Schema を先に更新する。

| # | 内容 | 使う場面 | 優先 |
|---|---|---|---|
| 1 | `GET /api/chat/articles/{id}/summary`（承認済み要約と記事カード） | 要約モーダル・ノベル画面の最初 | 必須 |
| 2 | 気分タグ・カテゴリで記事を返すAPI（元は `facets.json` の `moodTags`） | 候補ボタン | 必須 |
| 3 | `MessageRequest` に `articleId` | ノベル画面（作品）で作品を確実に指定 | 必須 |
| 4 | `/message` のカテゴリ絞り込み | リストの自由入力 | 任意 |

1・2 は LLM を使わないため、限定公開（合言葉＋sid）の外で出してよいかを決める必要がある（§10）。

---

## 9. Storybook での実装（最初の段階）

ページへ組み込む前に、Storybook で見た目と状態を作り切る。順番：

1. トークン追加（`globals.css`・`Typography.tsx`）と仮画像（`public/images/sayo/`）
2. `ui-parts`（`SayoFaceButton`・`SayoBubble`・`SayoChoice`・`SayoDeepButton`）
3. `ui-section`（`SayoAskBox`・`SayoSummary`・`SayoSearchResults`・`SayoPausedNotice`・`SayoNovelWindow`・`SayoShelf`）
4. `features/sayo`（架空の `SayoClient` を渡して、`SayoSummaryModal`・`SayoNovelStage` を通しで動かす）
5. カードのスロット（`HomeCard`・`PostCardImgTop`・`PostCardImgLeft`）と、`HomeTemplate` / `ListTemplate` の Story に組み込んだ見え方

Story に必ず含めるもの（AGENTS.md の Storybook 原則）：

| 種類 | 例 |
|---|---|
| 通常 | Default |
| 異常系（Chaos） | LongTitle（長い作品名・長い案内文）、NoImage、MixedData（タグ0個・3個、VODなし）、Dense（10件以上）、Extreme（20件以上・300字の要約） |
| 状態 | Loading、NoMatch、Paused（案内文あり／なし・再開予定あり）、LimitReached、Spoiler（伏せた状態・表示後）、Error |
| 幅 | SP（390px）／PC |

この段階では本番の API は呼ばない。ページ（`pages/`）にも組み込まない。

### 9.1 進み具合（2026-11-14）

| 手順 | 状態 | Storybook |
|---|---|---|
| 1. トークン・仮画像 | 済 | `Styles/Typography`（Sayo の色） |
| 2. ui-parts | 済 | `UI-Parts/Sayo/*` |
| 3. ui-section | 済 | `UI-Section/Sayo/*` |
| 4. features/sayo | 済（架空の `SayoClient`） | `Features/Sayo/*`。`SayoProvider` の Story で TOP／リストを通しで操作できる |
| 5. カードのスロット | 済（`HomeCard`・`PostCardImgTop`・`PostCardImgLeft` に `action`） | 各カードの `WithAction` |
| 5. テンプレートへの組み込み | 未 | — |

残り：`HomeTemplate` / `ListTemplate` への組み込み、`src/libs/api/sayoChat.ts`（本番の `SayoClient`）、`/api/sayo-chat-status` の API ルート、ai-chat 側の API 追加（§8）。

---

## 10. 未決事項

| # | 内容 |
|---|---|
| 1 | 限定公開の間、LLMを使わない部分（要約・候補ボタン）を合言葉なしで見せてよいか。合言葉が要る場合、入口をどこに置くか |
| 2 | 候補ボタンの種類と気分タグの一覧の揃え方 |
| 3 | 入口で自由入力を出すか（候補ボタンだけなら費用ゼロで運用できる） |
| 4 | ノベル画面の会話を、閉じたり再読み込みしたりしたときに残すか（API に履歴取得は無い） |
| 5 | 正式な立ち絵（表情5枚）の受領時期 |
