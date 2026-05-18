# Franchise（フランチャイズ）特集ページ Todo

> 設計の詳細は `franchise_acf_design.md` を参照。

---

## 完了済み（WordPress側）

- [x] DB: `wp_term_taxonomy.taxonomy` を `series` → `franchise` に更新
- [x] ACF UI: Custom Taxonomy key を `series` → `franchise` に変更
- [x] ACF UI: Field Group の Location Rules を `franchise` に変更
- [x] functions.php: `register_taxonomy` の競合なしを確認（ACFが全管理）

---

## 実装Todo（Next.js側）

### 1. データ取得層

- [ ] `lib/api/wordpress.ts` に `getFranchise(slug)` を追加
  - franchise taxonomy の term情報 + ACFフィールドを取得
  - WP REST API: `/wp/v2/franchise/{id}?acf_format=standard`
- [ ] `lib/api/wordpress.ts` に `getPostsByFranchise(slug)` を追加
  - franchise taxonomy が付与された投稿一覧を取得
  - WP REST API: `/wp/v2/posts?franchise={term_id}`
- [ ] `lib/api/wordpress.ts` に `getAllFranchiseSlugs()` を追加
  - ISR用の静的パス生成に使用

### 2. 型定義

- [ ] `types/franchise.ts` を新規作成
  - `FranchiseTerm`（taxonomy term + ACFフィールド）
  - `FranchiseACF`（ACFフィールド全体）
  - `TimelineItem`（repeater）
  - `HighlightItem`（repeater）
  - `RelatedLink`（repeater）

### 3. データ変換

- [ ] `transformPost()` に franchise ACFフィールドの正規化を追加
  - `timeline_text` / `highlights` / `related_links` の repeaterを配列に変換

### 4. ページ

- [ ] `pages/franchise/[slug].tsx` を新規作成
  - `getStaticPaths`: `getAllFranchiseSlugs()` で全slug取得
  - `getStaticProps`: `getFranchise()` + `getPostsByFranchise()` を `Promise.all` で並列取得
  - ISR: `revalidate: 3600`（1時間）

### 5. コンポーネント

- [ ] `components/franchise/FranchiseTemplate.tsx` を新規作成
  - Hero（画像 + キャッチコピー）
  - 概要（description）
  - ハイライト（highlights repeater）
  - 年表（timeline_text repeater、`show_timeline` フラグで制御）
  - 作品一覧（映画 / アニメ / ドラマ でタブ or セクション分け）
  - スコア比較（`show_score` フラグで制御）
  - CTA（「今すぐ観る」「レビューを読む」「配信を見る」）
- [ ] `components/franchise/FranchiseHero.tsx`
- [ ] `components/franchise/FranchiseTimeline.tsx`
- [ ] `components/franchise/FranchiseHighlights.tsx`
- [ ] `components/franchise/FranchisePostList.tsx`
- [ ] `components/franchise/FranchiseCTA.tsx`

### 6. スタイル

- [ ] `styles/franchise/` ディレクトリを作成
  - BEM + SCSS で各コンポーネントのスタイルを実装
  - デザイントークン: `#0a0618` / `#14082e` / `#ff2dfc` / `#c084fc`

### 7. SEO

- [ ] `<Head>` に以下を設定
  - `title`: `{シリーズ名} | 完全ガイド - KatsumaScore`
  - `description`: franchise の `description` フィールドから要約（~120文字）
  - OGP: `hero_image` を使用

---

## 実装順序

```
types/franchise.ts
  ↓
lib/api/wordpress.ts（getFranchise / getPostsByFranchise / getAllFranchiseSlugs）
  ↓
transformPost()の修正
  ↓
pages/franchise/[slug].tsx
  ↓
FranchiseTemplate（コンポーネント）
  ↓
スタイル / SEO
```

---

## 注意事項

- ACFはtaxonomyに紐付けているため、REST APIのレスポンス構造に注意（`acf_format=standard` が必要な場合あり）
- `featured_post` は relationship型のため、post IDの配列として返される
- `revalidate` の挙動はCloudflare Workers + Pages Routerで要検証（既知の懸念事項）
- slug変更は行わない（既存URLへの影響を最小化）
