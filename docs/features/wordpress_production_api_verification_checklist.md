# WordPress 本番 API 接続確認 — TODO チェックリスト

> フェーズ 7 作業用。完了した項目は `- [ ]` を `- [x]` に更新する。  
> 手順・コマンド例・トラブルシュート: [wordpress_production_api_verification.md](./wordpress_production_api_verification.md)

**完了条件:** 下記の該当チェックをすべて `[x]` にできること（ステージング代替可の箇所は本体ドキュメントの注記どおり）。README のロードマップチェックを `[x]` にするのは **実確認後**に限る。

---

## 1. 本番環境変数・シークレット

- [ ] `WP_API_URL` を本番デプロイ環境に設定（例: `https://katsumascore.blog/wp-json/wp/v2`）
- [ ] `NEXT_PUBLIC_WP_BASE_URL` を設定（例: `https://katsumascore.blog`）
- [ ] `NEXT_PUBLIC_SITE_URL` をフロントの正規 URL に設定
- [ ] `WP_SEASONAL_REVIEW_PARENT_ID` を本番 WordPress の親固定ページ ID に合わせる
- [ ] `WP_TOP_PAGE_SLUG` が本番の固定ページスラッグと一致する（未設定時は `top`）
- [ ] `WP_FEATURED_CATEGORY_SLUG` が本番と一致する（未設定時は `featured`）
- [ ] `WP_ANIME_CATEGORY_ID` またはスラッグ解決でアニメカテゴリが取れることを確認
- [ ] `WP_MOVIE_CATEGORY_SLUG` が本番と一致する（未設定時は `movie-ja`）
- [ ] 上記のシークレット・環境変数がリポジトリにコミットされていない

---

## 2. REST API 確認（本番）

### 2.1 到達性・ヘッダ・多言語・レイテンシ

- [ ] `/posts?per_page=1&_embed=1&acf_format=standard` が **200** で JSON を返す（`curl` は User-Agent 付き。例は本体ドキュメント）
- [ ] 匿名 GET がブロックされていない（WAF / Basic 認証で 401/403 にならない）
- [ ] `lang=ja` / `lang=en` で Polylang 想定どおり区別できる
- [ ] 投稿一覧で `X-WP-Total` / `X-WP-TotalPages` が返る
- [ ] 本番レイテンシが既定のタイムアウト・リトライで問題ない（不足時は `WpFetchOptions` を検討。本体参照）

### 2.2 リポジトリの自動検証（推奨）

事前に `WP_API_URL` を export してから実行。

- [ ] `npm run verify:wp-api` が成功する
- [ ] `npm run verify:wp-section2` が **relax なし**で成功する（ACF が REST に載っていない間は失敗しうる → 2.3 完了後に再実行）

### 2.3 WordPress: ACF を REST に公開

本体ドキュメント「WordPress: ACF を REST に公開する（作業手順）」に従う。

- [ ] ACF が **5.11 以降**である（または同等の REST 露出がコードで担保されている）
- [ ] 投稿用フィールドグループで **Show in REST API** が **Yes**（ロケーションが通常の**投稿**を含む）
- [ ] テーマ／プラグインに `acf/settings/rest_api_enabled` → `__return_false` が**無い**
- [ ] キャッシュ・最適化プラグインをフラッシュし、REST レスポンスで `acf` が落ちていない
- [ ] ブラウザで `.../wp/v2/posts/<ID>?_embed=1&acf_format=standard&lang=ja` を開き **`acf` がオブジェクト**で `review_score` 等が入っている
- [ ] 取得した 1 件以上で ACF・レビュー系が [`wordpress.transform.ts`](../../src/lib/api/wordpress.transform.ts) と整合している

---

## 3. ビルド・デプロイ

- [ ] 本番相当の `WP_API_URL` で `next build` が WordPress に到達して完走する（[ビルド例は本体ドキュメント](./wordpress_production_api_verification.md)）
- [ ] プレビューまたは本番でデプロイログに API 接続エラーがない

---

## 4. アプリ経由スモーク

- [ ] [`/`](../../src/pages/index.tsx) ホームが主要ブロックともに表示される
- [ ] [`/posts/[slug]`](../../src/pages/posts/[slug].tsx) 実在スラッグで表示（`ja` / `en` 両方で確認）
- [ ] [`/categories/[slug]`](../../src/pages/categories/[slug]/index.tsx) および [`/categories/[slug]/page/[page]`](../../src/pages/categories/[slug]/page/[page].tsx) が表示される
- [ ] [`/search`](../../src/pages/search.tsx) で検索結果が返る
- [ ] [`/featured`](../../src/pages/featured.tsx) が表示される
- [ ] [`/top`](../../src/pages/top.tsx) が表示される
- [ ] [`/seasonal-reviews`](../../src/pages/seasonal-reviews/index.tsx) / [`/seasonal-reviews/[slug]`](../../src/pages/seasonal-reviews/[slug].tsx) が表示される
- [ ] [`/server-sitemap.xml`](../../src/pages/server-sitemap.xml.tsx) が返り、主要 URL が含まれる

---

## 5. ロードマップ反映（任意）

- [ ] 上記完了後、[README.md](../../README.md) の「WordPress 本番 API との接続確認」を `[x]` にする

---

## メモ（自由記入）

<!-- 日付・担当・ステージング URL・ブロッカーなど -->
