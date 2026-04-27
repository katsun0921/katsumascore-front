# WordPress 本番 API 接続確認（フェーズ 7）

> 作成日: 2026-04-26  
> 対応ロードマップ: [README.md](../../README.md)「本番対応（フェーズ 7）」／ [docs/migration-plan.md](../migration-plan.md)「フェーズ 7: 本番対応」

## 本番 WordPress サイト

公開サイト: [https://katsumascore.blog/](https://katsumascore.blog/)（現行 WordPress 本番）

REST ベースは同一オリジン上の次を想定する（末尾スラッシュなし）:

- `WP_API_URL` → `https://katsumascore.blog/wp-json/wp/v2`
- `NEXT_PUBLIC_WP_BASE_URL` → `https://katsumascore.blog`（末尾スラッシュはプロジェクトの利用箇所に合わせる）

## 概要・ゴール

本番環境の WordPress REST API と Next.js 側クライアント（[`src/lib/api/wordpress.ts`](../../src/lib/api/wordpress.ts)）が、**環境変数・ネットワーク・レスポンス形式**の観点で期待どおり動作することを、再現可能な手順で確認する。

**完了条件:** [TODO チェックリスト](./wordpress_production_api_verification_checklist.md)の該当項目をすべて `[x]` にできること（ステージングで代替可の箇所は注記どおり）。

README のチェックボックスを完了にするのは、**実確認が終わったタイミング**で行う（ドキュメントの追加だけでは完了扱いにしない）。

---

## 進捗の記録

作業用のチェックボックスは **[wordpress_production_api_verification_checklist.md](./wordpress_production_api_verification_checklist.md)** に集約する。本ファイルは手順・参照・トラブルシュート用。

### 本番 API を向けたビルド例

`.env.local` がある場合は **シェルで先に export した値が優先される**点に注意する。

```bash
WP_API_URL=https://katsumascore.blog/wp-json/wp/v2 \
NEXT_PUBLIC_WP_BASE_URL=https://katsumascore.blog \
NEXT_PUBLIC_SITE_URL=https://katsumascore.blog \
npm run build
```

---

## 前提・スコープ

### クライアントの責務

[`wordpress.ts`](../../src/lib/api/wordpress.ts) は `process.env.WP_API_URL` をベースに、`wpFetch` および以下を提供する。

| 関数 | 用途 |
|------|------|
| `getPosts` / `getPostsWithMeta` | 一覧・ページネーション |
| `getPostBySlug` | 記事詳細 |
| `getCategories` / `getCategoryBySlug` | カテゴリ |
| `getTags` / `pickRandomTags` / `getPostsByTagId` | タグ・おすすめブロック |
| `searchPosts` | 検索 |
| `getPageBySlug` / `getChildPages` | 固定ページ・子ページ |
| `getRelatedPosts` | 関連記事 |

全リクエストに `_embed=1` と `acf_format=standard` が付与される。失敗時は多くが `null` または空配列を返す。

正規化・Zod 検証は [`src/lib/api/wordpress.transform.ts`](../../src/lib/api/wordpress.transform.ts) 側。レスポンス形状が本番でずれるとここで落ち、UI ではデータ欠落として現れる。

### 本書のスコープ外（別タスク）

- [README.md](../../README.md) 同フェーズの **ISR Webhook**・**Cloudflare Workers 本番検証** は接続確認後の運用・デプロイ層のため、本書では参照のみとする。

---

## 環境変数（本番）

§1（本番環境変数・シークレット運用）は、専用ドキュメントへ分離した。

- 手順・運用: [wordpress_production_env_secrets.md](./wordpress_production_env_secrets.md)
- チェック更新先: [wordpress_production_api_verification_checklist.md](./wordpress_production_api_verification_checklist.md)
- ローカル雛形: [`.env.example`](../../.env.example)

---

## 接続確認チェックリスト（手動）

| 観点 | 確認内容 |
|------|----------|
| 到達性 | 本番 `WP_API_URL` に対し、`/posts?per_page=1&_embed=1&acf_format=standard` が **200** で JSON を返す（ブラウザまたは `curl`） |
| 認証・制限 | 匿名 GET が許可されている。Basic 認証・WAF・IP 制限で Workers / CI の出口がブロックされていない |
| 多言語 | `lang=ja` / `lang=en` で Polylang 想定の件数・スラッグになる |
| ACF | レビュー系 ACF が `acf_format=standard` で欠けない（[`mapWPPostToPost`](../../src/lib/api/wordpress.transform.ts) と整合） |
| 一覧ヘッダ | `getPostsWithMeta` 利用箇所向けに、`X-WP-Total` / `X-WP-TotalPages` が返る |
| タイムアウト | 本番レイテンシに対し、既定 **3 秒タイムアウト・最大 2 回リトライ**で足りるか。不足する場合は [`WpFetchOptions`](../../src/lib/api/wordpress.ts) で調整を検討 |

**`curl` 例:**

本番では **デフォルトの curl User-Agent が 403** になることがある。`-A` でブラウザ相当を付与する。

```bash
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

# 環境変数を使う場合
curl -sS -A "$UA" -D - \
  "${WP_API_URL}/posts?per_page=1&_embed=1&acf_format=standard&lang=ja" \
  -o /dev/null

# 本番を直指定する場合
curl -sS -A "$UA" -D - \
  "https://katsumascore.blog/wp-json/wp/v2/posts?per_page=1&_embed=1&acf_format=standard&lang=ja" \
  -o /dev/null
```

### §2 自動検証（リポジトリ）

| コマンド | 内容 |
|----------|------|
| `npm run verify:wp-api` | 到達性・`lang=ja`/`en` の 200・`X-WP-Total` の有無（警告） |
| `npm run verify:wp-section2` | 上記に加えレイテンシ・**先頭 50 件のうち ACF オブジェクト付き投稿**で Zod / `mapWPPostToPost` |
| `npm run verify:wp-section2:relax` | ACF がまだ `[]` のとき: 先頭 1 件のみ検証し **警告付きで exit 0**（ACF 項は WordPress 修正後に再実行） |

いずれも事前に `WP_API_URL` を export する（例: `https://katsumascore.blog/wp-json/wp/v2`）。

### WordPress: ACF を REST に公開する（作業手順）

投稿の JSON で `acf` が **`[]`** や **空オブジェクト**のままだと、Next 側では [`WPPostSchema`](../../src/lib/api/wordpress.schema.ts) は通るが **`review_score` やリッチ用 ACF が常に欠落**する。次を **本番（またはステージング）の WordPress** で順に実施する。

公式リファレンス: [ACF | WP REST API Integration](https://www.advancedcustomfields.com/resources/wp-rest-api-integration/)

#### 1. ACF のバージョン

- **ACF 5.11 以降**（無料・PRO とも）でフィールドグループ単位の REST 表示が使える。**それより古い**場合は ACF を更新するか、別途 `register_rest_field` 等での露出が必要。

#### 2. フィールドグループで「REST に出す」を有効にする

1. WordPress 管理画面 → **ACF** → **フィールドグループ**（または「カスタムフィールド」メニュー）。
2. **投稿（post）** に表示されているレビュー用グループを開く（ロケーションルールが「投稿タイプ == 投稿」等になっているもの）。
3. 画面上部またはサイドの **グループ設定**（歯車アイコン / 「設定」タブ）を開く。
4. **Show in REST API**（REST API に表示）を **Yes** にする。  
   - デフォルトは **No** のため、未変更だと REST の `acf` が空に近い状態になりやすい。
5. **更新**を保存する。

カスタム投稿タイプだけに付いているグループは、その CPT の `wp/v2/<slug>` 側にだけ載る。本サイトのメイン記事が **通常の投稿**なら、ロケーションが **投稿**を含むグループを必ず有効にする。

#### 3. テーマ／プラグインで REST が無効化されていないか

次のフィルタが **`__return_false`** 等で付いていると、グループ設定と無関係に ACF 全体の REST が止まる。子テーマ・必須プラグインを **コード検索**する。

```php
// これがあると ACF の REST がすべてオフになる
add_filter( 'acf/settings/rest_api_enabled', '__return_false' );
```

見つかった場合は削除するか、意図を確認のうえ **`__return_true` に変更**する。

#### 4. キャッシュ・セキュリティ・最適化プラグイン

- **REST のレスポンスを短縮**するプラグインや CDN が、`acf` キーを落としていないか確認する。
- **オブジェクトキャッシュ**を使っている場合は、設定変更後に **キャッシュフラッシュ**する。

#### 5. リクエストに `acf_format=standard` を付ける

本リポジトリの [`wordpress.ts`](../../src/lib/api/wordpress.ts) は既に全リクエストに `acf_format=standard` を付与している。手動確認するときも同様に付ける（ネストした ACF の形が安定しやすい）。

#### 6. フロントが期待する ACF 名（参考）

正規化は [`wordpress.schema.ts`](../../src/lib/api/wordpress.schema.ts) / [`wordpress.transform.ts`](../../src/lib/api/wordpress.transform.ts) に合わせている。WordPress 側のフィールド名が次と**一致しているか**（タイポ含む）も確認する。

| 用途 | ACF 名（例） |
|------|----------------|
| レビュースコア | `review_score` |
| タイトル（日／英） | `title_jp`, `title_en` |
| あらすじグループ | `acf_summary_group`（`summary_jp` / `summary_en`） |
| 出演者 | `actors_filed`（WordPress 側スペルどおり） |
| 良かった点 | `good_point_filed` |
| その他 | `official_url`, `official_sns`, `streaming_vod_*`, `rental_services`, … |

#### 7. 動作確認

1. ブラウザで（ログアウト状態でもよい）  
   `https://katsumascore.blog/wp-json/wp/v2/posts/<投稿ID>?_embed=1&acf_format=standard&lang=ja`  
   を開き、JSON の **`acf` がオブジェクト**で、上記キーが入っていることを確認する。  
   - **`acf: []`** のままなら、グループの REST 表示・ロケーション・テーマの `rest_api_enabled` を再確認。
2. リポジトリで **`npm run verify:wp-section2`**（**非** `relax`）を実行し、exit 0 になることを確認する。

補足: 旧来の **`wp-json/acf/v3/posts/...`** が **404** でも問題ない。本プロジェクトは **`wp/v2/posts` の `acf` プロパティ**だけを使う。

### Polylang と `lang` パラメータ

`lang=ja` と `lang=en` で**先頭投稿のスラッグが同じ**場合、REST 側で言語フィルタが効いていない可能性がある。Polylang の **REST API / 言語**関連設定や、別プラグインによる `lang` クエリの解釈を確認する（詳細は Polylang ドキュメントに従う）。

---

## アプリ経由スモーク（本番ビルドまたはステージング）

ビルド・ランタイムの双方で `WP_API_URL` が本番（または本番相当）を指した状態で確認する。CI やローカルから本番 API を叩く場合は **シークレット管理**（URL の漏えい・誤コミット防止）に注意する。

`getStaticPaths` / `getStaticProps` を使うページは、**ビルド時に API に到達できること**も確認する。

| ルート（Pages Router） | 主なデータ取得 |
|------------------------|----------------|
| [`/`](../../src/pages/index.tsx) | `loadHomeTemplateProps` → `getPosts`, `getCategories`, `pickRandomTags`, `getPostsByTagId`, `getCategoryBySlug`, `getChildPages` 等 |
| [`/posts/[slug]`](../../src/pages/posts/[slug].tsx) | `getPostBySlug`, `getPosts`, `getTags`, `getRelatedPosts` |
| [`/categories/[slug]`](../../src/pages/categories/[slug]/index.tsx), [`/categories/[slug]/page/[page]`](../../src/pages/categories/[slug]/page/[page].tsx) | `getCategories` |
| [`/search`](../../src/pages/search.tsx) | `searchPosts`（CSR） |
| [`/featured`](../../src/pages/featured.tsx) | `getCategoryBySlug`, `getPostsWithMeta` |
| [`/top`](../../src/pages/top.tsx) | `getPageBySlug`（`WP_TOP_PAGE_SLUG`） |
| [`/seasonal-reviews`](../../src/pages/seasonal-reviews/index.tsx), [`/seasonal-reviews/[slug]`](../../src/pages/seasonal-reviews/[slug].tsx) | `getChildPages`, `getPageBySlug`（`WP_SEASONAL_REVIEW_PARENT_ID`） |
| [`/server-sitemap.xml`](../../src/pages/server-sitemap.xml.tsx) | `getPosts`, `getCategories`, `getChildPages` |

各ルートで **空の主要ブロックが続く／500 が出る**場合は、まず REST 直叩きとトラブルシュートで切り分ける。

---

## トラブルシュート（短い切り分け順）

1. **`WP_API_URL`**: ホスト・パス・`https` の誤り、末尾スラッシュの二重（`//posts` 等）。`.env` がビルド対象環境に載っているか。
2. **TLS / DNS**: 証明書エラー、名前解決失敗。サーバ側ログと `curl -v`。
3. **HTTP ステータス**: 401/403（認証・WAF）、429（レート制限）、5xx（WP・プラグイン）。[`shouldRetryStatus`](../../src/lib/api/wordpress.ts) は 429 と 5xx のみリトライ。
4. **タイムアウト**: 3 秒以内に応答が返らない。WP プラグイン・DB 負荷を確認。
5. **データ欠落・一部だけ空**: Zod `safeParse` 失敗や ACF 形状差。本番レスポンス 1 件を保存し [`wordpress.transform`](../../src/lib/api/wordpress.transform.ts) と突き合わせる。
6. **件数・ページネーション異常**: `X-WP-Total` / `X-WP-TotalPages` がプロキシで削られていないか。
7. **`acf: []`**: WordPress で ACF を REST に公開していない。上記「WordPress: ACF を REST に公開する（作業手順）」と [チェックリスト §2.3](./wordpress_production_api_verification_checklist.md) を実施する。
8. **手動 `curl` が 403**: User-Agent を付けずに叩いている。ブラウザ相当の `-A` を付与する。

---

## 関連（フェーズ 7・その他）

- [wordpress_production_api_verification_checklist.md](./wordpress_production_api_verification_checklist.md) — TODO チェックリスト（進捗はここを更新）
- [wordpress_production_api_operations_log.md](./wordpress_production_api_operations_log.md) — 実行ログ（証跡）
- [wordpress_production_env_secrets.md](./wordpress_production_env_secrets.md) — §1 本番環境変数・シークレット運用
- [polylang_rest_lang_issue.md](./polylang_rest_lang_issue.md) — §2.1 Polylang `lang` 判定の現状と切り分け
- [README.md](../../README.md) — 「本番対応（フェーズ 7）」: ISR Webhook、Cloudflare 本番検証
- [docs/migration-plan.md](../migration-plan.md) — フェーズ 7 の詳細項目（広告・パフォーマンス等は別途）
- [docs/archive/api-integration-plan.md](../archive/api-integration-plan.md) — lib/api 基盤・ページ接続の完了記録（参考）
