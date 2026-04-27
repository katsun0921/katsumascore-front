# WordPress 本番 API 接続確認 — 運用ログ

> 対象: フェーズ 7 の本番 API 接続確認  
> 手順: [wordpress_production_api_verification.md](./wordpress_production_api_verification.md)  
> 進捗: [wordpress_production_api_verification_checklist.md](./wordpress_production_api_verification_checklist.md)

## 記録ルール

- 1作業ごとに「日付 / 実行内容 / 結果 / 補足」を1ブロックで追記する
- コマンドは再現可能な最小セットのみ記載する
- ブロッカーが出た場合は「次アクション」を必ず残す

---

## 2026-04-26

### REST 自動検証

- **実行**
  - `WP_API_URL=https://katsumascore.blog/wp-json/wp/v2 npm run verify:wp-api`
  - `WP_API_URL=https://katsumascore.blog/wp-json/wp/v2 npm run verify:wp-section2`
- **結果**
  - 両方成功
  - `verify:wp-section2` は Polylang 警告あり（`lang=ja/en` 先頭 slug 一致）

### ACF REST 公開確認（§2.3）

- **実行**
  - `posts/12725?_embed=1&acf_format=standard&lang=ja` を確認
  - `cache_bust` クエリ付きでも同レスポンスを確認
- **結果**
  - `acf` は `object`
  - `review_score=3.3` を確認（フロント正規化では丸めて `3`）
  - `cache-control: s-maxage=10`、`acf` 欠落なし

### 本番 API 参照ビルド（§3）

- **実行**
  - `WP_API_URL=https://katsumascore.blog/wp-json/wp/v2 NEXT_PUBLIC_WP_BASE_URL=https://katsumascore.blog NEXT_PUBLIC_SITE_URL=https://katsumascore.blog npm run build`
- **結果**
  - build 完走

### スモーク確認（§4）

- **実行（ローカル起動 + 主要ルート確認）**
  - `/`, `/categories/...`, `/search`, `/featured`, `/top`, `/seasonal-reviews`, `/seasonal-reviews/[slug]`, `/server-sitemap.xml`
- **結果**
  - 上記は 200 を確認
  - `/posts/[slug]` は実在 slug でも 404（未解決）

### 未解決 / 次アクション

- Polylang `lang` 判定（`ja/en` 差分）を継続切り分け
  - 参照: [polylang_rest_lang_issue.md](./polylang_rest_lang_issue.md)
- `/posts/[slug]` 404 の原因切り分け
  - `getStaticPaths` 生成 slug と WP 現在 slug の整合確認
