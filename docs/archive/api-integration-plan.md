# lib/api 基盤整備 & ページ API 接続プラン

> 作成日: 2026-04-26  
> 対象ブランチ: `release/v1`  
> **アーカイブ:** 実装完了に伴い `docs/archive/` へ移動（元: `docs/features/api-integration-plan.md`）。

---

## 概要

README の「🚧 作業中（フェーズ 1-2）」を実装する。
大きく **A: lib/api 基盤整備** と **B: ページ API 接続** の 2 ブロックで構成する。

---

## A. lib/api 基盤整備

### A-1. `lib/api/wordpress.schema.ts` — Zod バリデーション

**目的:** WordPress REST API レスポンスを実行時に検証し、型安全性を保証する。

**作成するスキーマ:**

| スキーマ | 対応する WP 型 |
|---|---|
| `WPPostSchema` | `/posts` の 1 件 |
| `WPCategorySchema` | `/categories` の 1 件 |
| `WPTagSchema` | `/tags` の 1 件 |
| `WPEmbeddedSchema` | `_embedded` の `wp:featuredmedia` / `wp:term` |

**実装方針:**
- `zod` を使用する（既にインストール済みか要確認）
- `WPPost` 等の既存 TypeScript 型 (`src/types/wordpress.ts`) と整合させる
- `safeParse` で検証し、失敗時は `null` を返す（既存 `wpFetch` の catch 方針と統一）

```
- [x] zod のインストール確認（未導入なら `npm install zod`）
- [x] `WPEmbeddedSchema`（featuredmedia / wp:term）の定義
- [x] `WPPostSchema` の定義（acf.review_score を含む）
- [x] `WPCategorySchema` の定義
- [x] `WPTagSchema` の定義
- [x] 既存型 (`src/types/wordpress.ts`) との整合確認・必要に応じて更新
```

---

### A-2. `lib/api/wordpress.transform.ts` — transform 独立ファイル

**目的:** `wordpress.ts` 内の `mapWPPostToPost` と `stripHtml` を独立ファイルへ分離し、
単体テスト可能にする。

**移動する関数:**
- `stripHtml(html: string): string`
- `mapWPPostToPost(wp: WPPost): Post & { content: string }`

**実装方針:**
- `wordpress.ts` はファイルを import して再エクスポートし、既存の import パスを壊さない
- `mapWPPostToPost` に Zod バリデーション (`WPPostSchema.safeParse`) を組み込む

```
- [x] `src/lib/api/wordpress.transform.ts` の新規作成
- [x] `stripHtml` を移動
- [x] `mapWPPostToPost` を移動（Zod バリデーション組み込み）
- [x] `wordpress.ts` から re-export（既存 import パスを維持）
- [x] `pages/posts/[slug].tsx` など既存の import が壊れていないか確認
```

---

### A-3. `wpFetch` — リトライ・タイムアウト実装

**目的:** WordPress API の不安定さに対応し、本番での信頼性を高める。

**仕様:**
- タイムアウト: **3 秒**（`AbortController` + `setTimeout`）
- リトライ: **2 回**（初回失敗後に最大 2 回リトライ、合計最大 3 回試行）
- リトライ間隔: 指数バックオフ（500ms → 1000ms）
- 全試行失敗時は `null` を返す（既存の catch 方針を維持）

```
- [x] `AbortController` によるタイムアウト実装
- [x] リトライループの実装（最大 2 回）
- [x] 指数バックオフ（500ms / 1000ms）の実装
- [x] タイムアウト・リトライのパラメータを `wpFetch` オプションとして受け取れるよう設計
- [x] 既存の API 呼び出しが引き続き動作することを確認
```

---

## B. ページ API 接続

### B-1. `pages/index.tsx` — モック → 実 API（ISR）

**目的:** TOPページのモックデータを実 WordPress API データへ置き換える。

**現状:** `mockHeroData` 等 9 つのモックを `HomeTemplate` に渡している。

**実装方針:**
- `getStaticProps` + `revalidate` (ISR) で実装
- `getPosts` / `getCategories` 等を使ってデータ取得
- `HomeTemplate` の props 型に合わせて `mapWPPostToPost` でデータ変換

**取得データマッピング:**

| HomeTemplate prop | 取得元 |
|---|---|
| `hero` | `getPosts({ per_page: 1 })` の先頭（スコア最高）|
| `rankingPosts` | `getPosts({ per_page: 10 })` をスコア降順ソート |
| `latestPosts` | `getPosts({ per_page: 8 })` 最新順 |
| `animePosts` | `getPosts({ per_page: 8, category: アニメカテゴリID })` |
| `highScorePosts` | `getPosts({ per_page: 8 })` でスコア ≥ 4 |
| `recommendBlocks` | `getCategories()` をもとに構築（暫定モック維持可） |
| `vodFinderItems` | `src/lib/vod.ts` の定数から生成（API不要）|
| `seasonItems` | 暫定モック維持（季節アニメは別途設計）|
| `featuredItems` | `getPosts({ per_page: 6 })` |

```
- [x] `getStaticProps` の追加（`revalidate: 60` で ISR）
- [x] `hero` データの実 API 取得
- [x] `rankingPosts` データの実 API 取得
- [x] `latestPosts` データの実 API 取得
- [x] `animePosts` データの実 API 取得（カテゴリID確認が必要）
- [x] `highScorePosts` データの実 API 取得
- [x] `featuredItems` データの実 API 取得
- [x] `vodFinderItems` を `vod.ts` 定数ベースへ切り替え
- [x] `recommendBlocks` / `seasonItems` のモック → 実データ移行方針を決定（暫定モック維持で確定、`src/lib/homeStaticProps.ts` にコメント）
- [x] 型エラーなしで build が通ることを確認
```

---

### B-2. `pages/search.tsx` — 新規作成（CSR）

**目的:** 検索結果ページを新規作成する。

**仕様:**
- CSR（Client Side Rendering）
- `useRouter().query.q` から検索クエリを取得
- `searchPosts(query)` で API 検索
- `ListTemplate` を流用してレイアウト構成

**URL設計:** `/search?q=キーワード`

```
- [x] `pages/search.tsx` の新規作成
- [x] `useRouter` で `q` パラメータ取得
- [x] `searchPosts()` の呼び出し（`useEffect` + `useState`）
- [x] ローディング状態の表示（Skeleton or スピナー）
- [x] 検索結果ゼロ時の空状態表示
- [x] `ListTemplate` を使ったレイアウト適用
- [x] `SeoHead` の適用（`noindex` 推奨）
- [x] 既存 Search コンポーネント（`features/search/`）との接続確認（`SearchBox` が `/search?q=` に遷移）
```

---

### B-3. `pages/posts/[slug].tsx` — `getStaticPaths` 追加

**目的:** ビルド時に記事を事前生成し、SSG + ISR に切り替える。

**現状:** `getServerSideProps` で毎リクエスト SSR している。

**実装方針:**
- `getStaticPaths` で全スラッグを取得（`getPosts({ per_page: 100 })`）
- `fallback: 'blocking'` でビルド後の新記事もサポート
- `getServerSideProps` → `getStaticProps` へ変更
- `revalidate: 60` で ISR

```
- [x] `getStaticPaths` の実装（`getPosts({ per_page: 100 })` でスラッグ収集）
- [x] `getServerSideProps` → `getStaticProps` へ変更
- [x] `revalidate: 60` の設定
- [x] `fallback: 'blocking'` の設定
- [x] 多言語（`locale`）対応の維持（`locales` を `getStaticPaths` で展開）
- [x] 既存の `highScorePosts` / `genres` 取得ロジックの維持
- [x] build エラーがないことを確認
```

---

## 実装順序（推奨）

```
A-1（schema）→ A-2（transform）→ A-3（リトライ）→ B-3（getStaticPaths）→ B-1（index ISR）→ B-2（search）
```

A を先に固めることで B の実装時に型安全なデータ変換を使える。
B-3 は既存ページへの影響が小さく、リスクが低いため先に着手する。

---

## 補足: 依存確認

| 確認項目 | 確認方法 |
|---|---|
| `zod` のインストール有無 | `cat package.json \| grep zod` |
| `WP_API_URL` 環境変数 | `.env.local` に `WP_API_URL=...` が設定済みか |
| アニメカテゴリの ID | WordPress 管理画面または `getCategories()` の実行結果 |
