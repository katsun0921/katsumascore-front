# WordPress API レイヤー再構成プラン

`src/lib/api/` の WordPress クライアントを「読みやすさ最重要」で再構成するための進行計画。
GraphQL は本番側プラグイン依存・既存 transform 全書き直しのリスクから不採用。
代わりに **REST のまま「必要なフィールドだけ取る」+ 型安全クライアント化** で GraphQL の採用動機の大半を回収する。

## 方針サマリ

| レイヤー | 担当 |
|---|---|
| HTTPクライアント（fetch / タイムアウト / リトライ） | `openapi-fetch` を薄くラップした `client.ts` |
| パス・クエリ・レスポンスの型 | `openapi-typescript` で生成した型 |
| 取得フィールド絞り込み | WP REST の `_fields` クエリ |
| ランタイム検証・正規化 | Zod (`schema.ts`) + `transform.ts` |
| エンドポイント別関数 | `endpoints/posts.ts` 等にファイル分割 |

ポイント:
- `openapi-typescript` の型 = **コンパイル時**の補完・リクエスト側の型安全
- Zod = **ランタイム**検証 + ACF の揺れ吸収（`looseBool`、`acf: []` → `undefined` 等）
- 役割が違うので二重ではない

## 目標ディレクトリ構成

```
src/lib/api/wordpress/
├── generated/
│   └── wp-schema.d.ts     ← openapi-typescript 自動生成（手で触らない）
├── client.ts              ← openapi-fetch インスタンス + リトライ/タイムアウト + _fields 既定値
├── endpoints/
│   ├── posts.ts
│   ├── categories.ts
│   ├── tags.ts
│   └── pages.ts
├── schema.ts              ← 既存 Zod スキーマ（ランタイム保険 + ACF 揺れ吸収）
├── transform.ts           ← 既存 + category/tag/page 正規化を追加
└── index.ts               ← 公開 API（barrel）
```

---

## 進め方（段階導入）

一気にやると差分が大きくレビューしづらく、`release/v1` の本番 API 接続検証作業ともぶつかる。
**3 ステップに分割し、各ステップで挙動を確認しながら進める。**

### Step 1: ファイル分割 + `wpFetch` 統合 + `_fields` 対応

依存追加なし。動作は等価のままコードの読みやすさを大きく改善する。

- [x] `src/lib/api/wordpress/` ディレクトリを作成
- [x] 既存 `wordpress.schema.ts` を `wordpress/schema.ts` へ移設
- [x] 既存 `wordpress.transform.ts` を `wordpress/transform.ts` へ移設
- [x] `wpFetch` と `wpFetchPostsWithMeta` を 1 つに統合（generics で「ヘッダ込みで返すか body だけか」を切替）
- [x] `client.ts` にタイムアウト・リトライ・`_embed` / `acf_format` / `_fields` の既定値付与を集約
- [x] `endpoints/posts.ts` に `getPosts` / `getPostsWithMeta` / `getPostBySlug` / `getRelatedPosts` / `searchPosts` を分割
- [x] `endpoints/categories.ts` / `tags.ts` / `pages.ts` を分割
- [x] `_fields` パラメータを各エンドポイントで指定（**`_links,_embedded` を必ず含める** — transform が `_embedded` 依存）
- [x] `index.ts` で公開 API を barrel export
- [x] 旧 `wordpress.ts` を削除し、import 元（`pages/posts/[slug].tsx` 等）を新パスに更新
- [x] `npm run build` と本番 API 検証スクリプト（`scripts/verify-wp-api.sh` / `scripts/verify-wp-section2.ts`）で挙動が等価であることを確認

### Step 2: OpenAPI スキーマ + 型生成の導入

サーバ側を一切触らず、フロント側完結で型安全性を一段上げる。

- [x] `openapi/wp.yaml` を手書きで作成（最小版: `/posts` のみ、`parameters` は実際に使うクエリだけ）
- [x] `package.json` に dev 依存追加: `openapi-typescript`
- [x] `package.json` に scripts 追加:
  ```json
  "wp:gen-types": "openapi-typescript openapi/wp.yaml -o src/lib/api/wordpress/generated/wp-schema.d.ts"
  ```
- [x] `npm run wp:gen-types` で型生成し、`generated/wp-schema.d.ts` を確認
- [x] `/categories`, `/tags`, `/pages` を `openapi/wp.yaml` に追加して再生成
- [x] `generated/` を git 管理（CI 不要・差分が見える運用）

### Step 3: `openapi-fetch` への置換

`client.ts` と各 endpoint のリクエスト部分に差分が局所化される。

- [x] runtime 依存追加: `openapi-fetch`
- [x] `client.ts` を `openapi-fetch` ベースに置換（`createClient<paths>({ baseUrl, ... })`）
- [x] タイムアウト・リトライは `openapi-fetch` のミドルウェアまたは薄いラッパーで実装
- [x] 各 endpoint を `client.GET("/posts", { params: { query: { ... } } })` 形式に置換
- [x] レスポンスは `openapi-fetch` の型で受けたうえで、UI に渡す前に Zod でパース＆正規化（`mapWPPostToPost`）
- [x] 本番 API 検証スクリプトで挙動が等価であることを再確認

---

## 将来検討（今はやらない）

- [ ] `/wp-json` ディスカバリから OpenAPI を自動生成する変換スクリプト（`scripts/wp-discovery-to-openapi.ts`）。手書き `openapi/wp.yaml` の保守がつらくなったら着手。
- [ ] WPGraphQL への移行。1 ページで複数回 REST を叩くなど REST 由来の痛みが実測で出てから判断。
- [ ] CSR 部分（検索モーダル等）への SWR / TanStack Query 導入。SSG/ISR 主体の現状では過剰。

---

## 不採用案と理由

| 案 | 不採用理由 |
|---|---|
| GraphQL (WPGraphQL) | サーバ側プラグイン依存。ACF 連携プラグインが WP 本体更新で壊れやすい。本番検証作業と競合 |
| axios | 重大なセキュリティリスク履歴のため利用禁止 |
| ky | 魅力的だが現状のリトライ要件は十数行で書ける。`openapi-fetch` と役割が被る |
| `@wp-api/openapi-spec` 等の既製スキーマ | 更新が止まっており「更新頻度が高いものに限る」要件に合致しない |
| ts-rest / zodios | WP REST のコントラクトを手書きする負担が大きい。OpenAPI を使える分 `openapi-fetch` が有利 |
| tRPC | 自分のサーバ向け。他人の API（WP）には適用不可 |
