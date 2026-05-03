# WordPress → Next.js 移行手順

> **ステータス:** アーカイブ（2026-04-26）。移行実装完了時点の参照用ドキュメント。最新の挙動はリポジトリの `src/pages/`・`src/lib/`・`CLAUDE.md` を正とする。
>
> 対象: `katsumascore_wordpress_theme` → `katsumascore-front`（Next.js）  
> 作成日: 2026-04-21

---

## 0. 全体方針

- WordPress テーマの「移植」ではなく、Next.js での「再設計」とする
- WordPress 生データ（`post.title.rendered` 等）は `lib/api` で正規化し、UI 層には渡さない
- ACF などのプラグイン依存は `lib/api` 層で吸収する（記事の言語は ACF `lang`。Polylang は使用しない）
- レイヤー構成は `CLAUDE.md` の規約（ui-parts / ui-layout / ui-section / features / templates）に従う

---

## 1. テンプレート対応マップ

| WordPress テンプレート | Next.js ページ / テンプレート（実装パス） |
|---|---|
| `page-home.php` | `pages/index.tsx` + `HomeTemplate` |
| `archive.php` | `pages/categories/[slug]/index.tsx`（ページネーション: `.../page/[page].tsx`）+ `ListTemplate` |
| `single.php` | `pages/posts/[slug].tsx` + `PostDetail` |
| `search.php` | `pages/search.tsx` + `ListTemplate` |
| `page-top.php` | `pages/top.tsx` |
| `page-featured-article.php` | `pages/featured.tsx` |
| `page-seasonal-anime-and-dramas-reviews.php` | `pages/seasonal-reviews/index.tsx`・`pages/seasonal-reviews/[slug].tsx` |
| `404.php` | `pages/404.tsx` + `NotFoundTemplate` |
| `header.php` / `footer.php` / `sidebar.php` | `PageLayout` + `ui-layout/Header` + `ui-layout/Footer` + `ui-layout/Sidebar` |

---

## 2. データフロー設計

```
WordPress REST API / ACF API
        ↓
lib/api/wordpress.ts     ← fetch + 生データ取得
lib/api/wordpress.schema.ts  ← Zod等でバリデーション
        ↓
lib/buildPostDetailFromWp.ts / wordpress.transform（正規化）
        ↓
components（正規化済みデータのみ受け取る）
        ↓
pages（getStaticProps / getServerSideProps）
```

### 正規化の原則

- `post.title.rendered` + ACF タイトル → `normalizedPost.title` / `originalTitle`（`mapWPPostToPost` のみ）
- `post.acf.review_score` 等 → `normalizedPost.score` / 詳細用フィールド
- `post._embedded['wp:featuredmedia'][0].source_url` → サムネイル
- ACF の VOD フラグ等 → `streamingVods`（`buildPostDetailFromWp`）
- 多言語: `next.config` の `i18n` + API の `lang` クエリ（任意）+ **ACF `lang`** による正規化・フィルタ

---

## 3. ページ別移行手順

（以下、当初の設計メモ。コード例は擬似。実装は上記 §1 のパスを参照。）

### 3-1. ホームページ

- 実装: `loadHomeTemplateProps`（`src/lib/homeStaticProps.ts`）— ランダムタグ、`movie` 特集、季節子ページ、任意で Facebook iframe / `next/script`（`HomePageEmbeds`）。

### 3-2. アーカイブ

- 実装: `loadCategoryListPage`（`src/lib/loadCategoryListPage.ts`）、`getPostsWithMeta`。

### 3-3. 記事詳細

- 実装: `buildPostDetailFromWp`、`extractRelationPostIds`、`getRelatedPosts`。

### 3-4. 検索

- 実装: CSR + `searchPosts`（`pages/search.tsx`）。

---

## 4. プラグイン依存の処理

（ACF 中心の対応方針は維持。正規化の集約先に `buildPostDetailFromWp` を追加。）

---

## 5. 移行チェックリスト（完了時点）

### フェーズ 1: 基盤整備

- [x] `lib/api/wordpress.ts` — 一覧・タグ・カテゴリ・検索・関連・固定ページ・子ページ・ページネーション（`getPostsWithMeta`）等
- [x] `lib/api/wordpress.schema.ts` — Post / Category / Tag / 主要 ACF 形状のバリデーション
- [x] 正規化 — `wordpress.transform` + `buildPostDetailFromWp`（記事詳細で使用する ACF。本文は `content.rendered`、追加ブロックは WP 側 HTML に依存）
- [x] Next.js locale（`i18n`）+ API `lang` クエリ + ACF `lang` 正規化

### フェーズ 2: ページ別実装

- [x] `pages/index.tsx` + `HomeTemplate`
- [x] カテゴリアーカイブ + `ListTemplate`（`categories/[slug]/index.tsx`、`page/[page].tsx`）
- [x] `pages/posts/[slug].tsx` + `PostDetail`
  - [x] 本文・サイドバー（`PostContent` / `StreamingVod` / `RelationPost` / `AdRental` 等へのデータ配線）
- [x] `pages/search.tsx`
- [x] `pages/404.tsx` + `NotFoundTemplate`
- [x] `top.tsx` / `featured.tsx` / `seasonal-reviews/*`

### フェーズ 3: SEO / メタ

- [x] `next-seo`（JSON-LD 等）+ `SeoHead`（OGP / Twitter / `hreflang`）
- [x] `next-sitemap` + `server-sitemap.xml`

### フェーズ 4: 品質

- [x] Storybook — テンプレート単位で異常系（例: `ListTemplate` の Dense / Extreme 等）
- [ ] Lighthouse / WordPress との表示比較 — **リリース前の手動チェックリスト**（自動化対象外）

---

## 6. 注意事項

### 著者ページ

`next.config` の `redirects` で `/author/:slug` → `/404`（`permanent: false`）。

### 広告コード

`next/script`（例: `lazyOnload`）。ホームでは `HomePageEmbeds` の `extraScriptSrcs`。

### Facebook ページ埋め込み

iframe は CSS クラスで寸法管理（`style` prop 禁止ルールに準拠）。

### 映画公開中フラグ

`is_cinema_showing` を正規化し、Sidebar の VOD / レンタル表示と連動。

### 環境変数（例）

- `WP_SEASONAL_REVIEW_PARENT_ID` — 季節レビュー親ページ ID  
- `WP_MOVIE_CATEGORY_SLUG` — 既定 `movie`  
- `WP_TOP_PAGE_SLUG` / `WP_FEATURED_CATEGORY_SLUG`  
- `NEXT_PUBLIC_FACEBOOK_TIMELINE_EMBED_URL` / `NEXT_PUBLIC_HOME_EXTRA_SCRIPT_SRCS`（任意）

---

*このファイルは `docs/features/` から移行完了に伴いアーカイブ化した。*
