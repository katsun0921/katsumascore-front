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

**完了条件（このドキュメントのチェックリストをすべて満たすこと）:**

- 本番 `WP_API_URL` への到達性と、匿名 GET での主要エンドポイント応答が確認できている
- Polylang・ACF・一覧ヘッダが本番データで期待どおりである
- 下記「アプリ経由スモーク」の各ルートで空振り・500 が再現しない（ステージングで代替可）

README のチェックボックスを完了にするのは、**上記の実確認が終わったタイミング**で行う（本書の追加だけでは完了扱いにしない）。

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

### 必須

| 変数 | 説明 |
|------|------|
| `WP_API_URL` | WordPress REST のベース URL。**末尾は `/wp-json/wp/v2`（末尾スラッシュなし推奨）**。未設定時は `wpFetch` が即 `null` を返す。 |

参照: [`.env.example`](../../.env.example)（ローカル用。本番は上記ドメインに置き換える）

**本番の例（値はデプロイ環境のシークレットに設定）:**

```bash
WP_API_URL=https://katsumascore.blog/wp-json/wp/v2
NEXT_PUBLIC_WP_BASE_URL=https://katsumascore.blog
```

### 本番で値の整合が必要な関連変数

API 直結ではないが、ページ内容・サイトマップ・ホーム構成に影響する。

| 変数 | 用途 |
|------|------|
| `NEXT_PUBLIC_WP_BASE_URL` | WP サイトの公開 URL（画像・リンク等） |
| `NEXT_PUBLIC_SITE_URL` | フロントの正規 URL（OG・canonical 等） |
| `WP_SEASONAL_REVIEW_PARENT_ID` | 季節レビュー親固定ページ ID（[`seasonal-reviews/`](../../src/pages/seasonal-reviews/index.tsx)、[`server-sitemap.xml`](../../src/pages/server-sitemap.xml.tsx)） |
| `WP_TOP_PAGE_SLUG` | トップ相当固定ページのスラッグ（既定: `top`）([`top.tsx`](../../src/pages/top.tsx)) |
| `WP_FEATURED_CATEGORY_SLUG` | 特集カテゴリスラッグ（既定: `featured`）([`featured.tsx`](../../src/pages/featured.tsx)) |
| `WP_ANIME_CATEGORY_ID` | 数値 ID が分かる場合はアニメカテゴリに使用（未設定時はスラッグ `anime` 等で解決）([`homeStaticProps.ts`](../../src/lib/homeStaticProps.ts)) |
| `WP_MOVIE_CATEGORY_SLUG` | 映画カテゴリスラッグ（既定: `movie-ja`） |

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

```bash
# 環境変数を使う場合
curl -sS -D - \
  "${WP_API_URL}/posts?per_page=1&_embed=1&acf_format=standard&lang=ja" \
  -o /dev/null

# 本番を直指定する場合
curl -sS -D - \
  "https://katsumascore.blog/wp-json/wp/v2/posts?per_page=1&_embed=1&acf_format=standard&lang=ja" \
  -o /dev/null
```

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

---

## 関連（フェーズ 7・その他）

- [README.md](../../README.md) — 「本番対応（フェーズ 7）」: ISR Webhook、Cloudflare 本番検証
- [docs/migration-plan.md](../migration-plan.md) — フェーズ 7 の詳細項目（広告・パフォーマンス等は別途）
- [docs/archive/api-integration-plan.md](../archive/api-integration-plan.md) — lib/api 基盤・ページ接続の完了記録（参考）
