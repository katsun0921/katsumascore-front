# KatsumaScore 移行進捗 TODO

> 対象: `katsumascore_wordpress_theme` → `katsumascore-front`（Next.js）
> 方針: WordPressはCMSのみ。Next.jsでフロントエンドを再設計する。
> 最終更新: 2026-04-26

> [!IMPORTANT]
> 移行元の `katsumascore_wordpress_theme` は**読み取り専用**とする。
> コードの修正・追加・削除は一切行わない。参照・調査のみ許可する。

---

## テンプレート対応表

| WordPress テンプレート | Next.js ページ / テンプレート |
|---|---|
| `page-home.php` | `pages/index.tsx` + `HomeTemplate` |
| `archive.php` | `pages/[category]/index.tsx` + `ListTemplate` |
| `single.php` | `pages/posts/[slug].tsx` + `PostDetail` |
| `search.php` | `pages/search.tsx` + `ListTemplate` |
| `page-top.php` | `pages/top.tsx` |
| `page-featured-article.php` | `pages/featured.tsx` |
| `page-seasonal-anime-and-dramas-reviews.php` | `pages/seasonal-reviews/index.tsx` |
| `404.php` | `pages/404.tsx` + `NotFoundTemplate` |
| `header.php` / `footer.php` / `sidebar.php` | `PageLayout` + `ui-layout/Header` + `ui-layout/Footer` + `ui-layout/Sidebar` |

---

## プラグイン依存の処理方針

### Polylang（多言語）

| WordPress | Next.js |
|---|---|
| `pll_current_language()` | `useLocale()` from `@/i18n/provider` |
| `pll_get_post($id, 'en')` | `fetchPostBySlug(slug, locale)` |
| `pll_home_url()` | `next/router` の `locale` |

### ACF（Advanced Custom Fields）

- REST API 拡張（`acf-to-rest-api`）経由で `/wp-json/wp/v2/posts/{id}?acf_format=standard` から取得
- `lib/api/wordpress/transform.ts` の `transformPost()` で正規化

---

## 移行非対象

以下は Next.js に移行しない。

- CSS / JS enqueue（Tailwind / SCSS で代替）
- コメント機能
- 月別アーカイブ
- 管理画面カスタマイズ
- ショートコード（ACF で代替）

---

## ✅ 完了済み

### 基盤整備
- [x] Next.js 15 (Pages Router) / TypeScript / Tailwind CSS v4 の初期設定
- [x] Storybook 8 のセットアップ（i18n toolbar、decorator 含む）
- [x] i18n 基盤の構築（`I18nProvider`, `t()` 関数、コンポーネントローカル `i18n.ts`）
- [x] ESLint カスタムルール（`katsumascore-ui/no-hardcoded-i18n` 等）
- [x] Stylelint 設定
- [x] Husky によるコミットフック
- [x] Cloudflare Workers (OpenNext) デプロイ設定
- [x] WordPress REST API クライアント基本実装（`lib/api/wordpress.ts`）
- [x] レイヤー設計の確立（`ui-parts / ui-layout / ui-section / ui-home / features / templates`）
- [x] `components/ui/` → `components/ui-parts/` / `components/ui-home/` / `components/ui-layout/` へリネーム統一

### ui-parts / ui-layout / ui-section / ui-home
- [x] Badge / Breadcrumb / CTAButton / Category / Score / ScoreHexBadge / SearchResultItem / ShareButtons / VideoEmbed / VodDots / VodLink / VodMenuItem
- [x] PostCard 基礎部品（Container / Media / Body / Skeleton）
- [x] Header / Footer / Container / Sidebar（ui-layout）
- [x] PostCard（ImgTop / ImgLeft / ImgOverlay）/ PostList / PostSection（ui-section）
- [x] HomeCard / HomeCardScrollList / HomeFeatured / HomeRanking / HomeRecommend / HomeSeasonReview / HomeVodFinder（ui-home）

### features / templates / pages
- [x] Post / PostCard / PostContent / PostDate / PostHeader / PostTitleMeta / TableOfContents
- [x] navigation / HeaderNav / HamburgerMenu
- [x] Search / SearchBox / Pagination / RelationPost / VodMenu / StreamingVod
- [x] PageLayout / HomeTemplate / ListTemplate / PostDetail / NotFoundTemplate
- [x] `pages/posts/[slug].tsx`（記事詳細・実API接続済み）
- [x] `pages/categories/[slug].tsx`（カテゴリアーカイブ・実API接続済み）
- [x] `pages/404.tsx`

### lib/api 基盤整備（フェーズ 1）
- [x] 全エンドポイント定義（getPosts / getPostBySlug / getCategories / getTags / searchPosts 等）
- [x] `lib/api/wordpress/schema.ts` の作成（Zod によるレスポンスバリデーション）
- [x] `lib/api/wordpress/transform.ts` の作成（`transformPost()` を独立ファイルへ分離）
- [x] `mapWPPostToPost()` で ACF フィールドを正規化（score / vod / isCinemaShowing 等）
- [x] Polylang 対応（`lang` パラメータ経由）
- [x] fetch にリトライ（最大 2 回）・タイムアウト（3 秒）を実装

### ページ API 接続（フェーズ 2）
- [x] `pages/index.tsx` のモックデータ→実APIデータへ置き換え（`getStaticProps` + ISR）
- [x] `pages/search.tsx` の新規作成（CSR + `searchPosts()`）
- [x] `pages/posts/[slug].tsx` に `getStaticPaths` を追加（ビルド時事前生成）
- [x] カテゴリアーカイブ: `getStaticPaths` でカテゴリ一覧から動的パス生成
- [x] カテゴリアーカイブ: ソート・フィルター機能（評価順 / 新着）
- [x] `pages/404.tsx` の作成

### コンポーネント整理（一部完了）
- [x] AdRental（`features/AdRental` wrapper + `ui-section/AdRental` 純粋UIに分離済み・Sidebar使用中）
- [x] GenreNav（HomeTemplate から使用中）
- [x] Profile（Sidebar から使用中）
- [x] RelatedPosts
- [x] SeoHead

### SEO / メタデータ（フェーズ 3）
- [x] `next-seo` 導入（v7: JSON-LD専用）・全ページOGP / Twitter Card対応
- [x] JSON-LD構造化データの実装（Product + review + aggregateRating + BreadcrumbList）
- [x] Google Analytics（GA4）・Google AdSenseの実装（`next/script` / 本番環境のみ / 多言語対応）
- [x] サイトマップの実装（`/sitemap.xml`・`/server-sitemap.xml` / 動的ルート対応・ja/en両ロケール）
- [x] `robots.txt` の設定

---

## 🚧 作業中

### ページ API 接続（フェーズ 2 残）
- [x] `lib/api/wordpress.types.ts` の作成（`WPPost` / `NormalizedPost` 等の型定義を集約）
- [x] `null` / 欠損を前提とした型設計の確認・修正
- [x] `pages/posts/[slug].tsx`: `getStaticProps` + `revalidate` への切り替え検討（現在 SSR）
- [x] アーカイブリダイレクト: `next.config.ts` に `/author/:slug` → `/404` リダイレクト追加
- [x] アーカイブリダイレクト: 月別アーカイブ・タグアーカイブのリダイレクト設定

### コンポーネント整理（フェーズ 3）
- [ ] CinemaCheck（`ui-section/CinemaCheck` は使用中、`features/CinemaCheck` wrapper は未接続）

### 未使用コンポーネントの整理
- [ ] `features/Pagination` — 未接続（ListTemplate等への接続またはui-section移行）
- [x] `features/Carousel` — 削除済み
- [ ] `features/Post/PostDate` — 完全未使用（削除または接続先の検討）
- [ ] `features/VodPanel` — 完全未使用（`ui-section/VodPanel`との重複整理）
- [ ] `features/OfficialSns` — 適切なレイヤーへ移動または削除
- [ ] `features/PickUpAndScore` — 適切なレイヤーへ移動
- [ ] `features/ReviewSiteScores` — 適切なレイヤーへ移動
- [ ] `features/ScoreWithRank` — 適切なレイヤーへ移動
- [ ] `ui-layout/Container` — 完全未使用（削除または接続先の検討）
- [ ] `ui-parts/Badge` — 完全未使用
- [ ] `ui-parts/CTAButton` — 完全未使用
- [ ] `ui-parts/Category` — 完全未使用
- [ ] `ui-parts/VodLink` — 完全未使用
- [x] `ui-parts/Affiliate/Admax` — 未使用（Tsutaya / Geo は AdRental で使用中）
- [x] `ui-parts/Affiliate/Wowow` — 未使用
- [x] `ui-section/ProductBlock` — 完全未使用（Gutenberg確認用途として保持か削除か要判断）
- [ ] `ui-section/VodIntroduction` → `ui-section/` 内での位置整理
- [ ] `features/vod/` への整理（`VodMenu`, `VodPanel`, `VodItem` 等）
- [ ] `features/Post/PostVariants` の整備
- [x] `ui-section/PostListRow` コンポーネントの実装（新設）

### 本番対応（フェーズ 4）
- [ ] WordPress 本番 API との接続確認（[手順・参照](wordpress_production_api_verification.md) / [TODO チェックリスト](wordpress_production_api_verification_checklist.md)）
- [ ] Cloudflare Workers デプロイの本番検証
- [ ] 広告コード（A8.net / admax）を `next/script` で管理
- [ ] Facebook ページ埋め込みの CSS クラス管理（`style` prop 禁止対応）
- [ ] パフォーマンス最適化（`next/image` 最適化・Code Splitting）
- [ ] ISR Webhook設定（WordPress更新時にrevalidate）
- [ ] VOD ページは SSR のままとする確認

---

## 📋 今後の予定

### Storybook 品質確認（フェーズ 5）
- [ ] 全 `ui-parts` コンポーネントに異常系 Story を追加
  - [ ] `LongTitle` — 長いタイトル
  - [ ] `NoImage` — サムネイルなし
  - [ ] `MixedData` — 欠損混在データ
  - [ ] `Dense`（10 件以上）
  - [ ] `Extreme`（20 件以上）
- [ ] `ui-section` コンポーネントの Story 整備
- [ ] `features` コンポーネントの Story 整備
- [ ] Storybook GitHub Pages への自動デプロイ確認（`release/v1` ブランチ）

### 品質・テスト（フェーズ 6）
- [ ] Vitest によるユニットテスト整備（`lib/api/` / `lib/utils/` 優先）
- [ ] ESLint カスタムルール `katsumascore-ui/no-hardcoded-i18n` の全コンポーネント適用確認
- [ ] ESLint ルールの `warn` → `error` 昇格
- [ ] Lighthouse スコア確認（Performance / SEO / A11y）
- [ ] アクセシビリティ対応（ARIA 属性・キーボード操作）

### 公開後対応（フェーズ 7）
- [ ] 全コンポーネントに Storybook Story 作成
- [ ] 異常系 Story（NoImage / LongTitle / MixedData / Dense / Extreme）
- [ ] Lighthouse スコア確認（Performance / SEO / A11y）
- [ ] WordPress との表示比較（主要ページ）
- [ ] パフォーマンス最適化・アクセシビリティ対応
- [ ] 全 ui-parts に異常系 Story（LongTitle / NoImage / MixedData / Dense / Extreme）を追加

### リニューアル施策（フェーズ 8）

- [ ] Franchise（シリーズ）特集ページの実装（[設計書](./franchise_acf_design.md)）
  - [ ] WordPress 側: franchise taxonomy + ACF フィールド設定
  - [ ] `lib/api/wordpress.ts` に `getPostsByFranchise(slug)` を追加
  - [ ] `transformPost()` で franchise ACF フィールドを正規化
  - [ ] `pages/franchise/[slug].tsx` の新規作成（ISR）
  - [ ] FranchiseTemplate の実装（Hero / 概要 / ハイライト / 年表 / 作品一覧 / スコア比較 / CTA）
  - [ ] SEO: title = シリーズ名 + ガイド、description = シリーズ概要要約

---

### 🔴 最優先: Entity統合（person / company）CPT 移行（[設計書](../renewal/entity_design_complete.md)）

> actor / director / company を taxonomy から CPT へ移行し、人・企業を「分類」ではなく「主役」として扱う。

#### Phase 1 — taxonomy 運用（現状）
- [x] `/ja/actor/{slug}` / `/ja/director/{slug}` を taxonomy として運用中

#### Phase 2 — CPT 導入（WordPress + フロントエンド）
- [ ] WordPress 側: `person` CPT + ACF フィールド設定（name / slug / roles / bio / image）
- [ ] WordPress 側: `company` CPT + ACF フィールド設定（name / slug / roles / description / logo）
- [ ] WordPress 側: Post に `cast` / `director` / `production_companies` / `distributors` の relationship フィールド追加
- [ ] `lib/api/wordpress/generated/wp-schema.d.ts` を再生成（person / company エンドポイント追加）
- [ ] `lib/api/wordpress/endpoints/persons.ts` 新設（`getPerson` / `getPersonBySlug` / `getPersonsByRole`）
- [ ] `lib/api/wordpress/endpoints/companies.ts` 新設（`getCompany` / `getCompanyBySlug`）
- [ ] `lib/api/wordpress/transform.ts` に person / company の正規化処理を追加
- [ ] `src/lib/route.ts` に `getEntityUrl(type, slug, lang)` を追加
- [ ] `pages/person/[slug].tsx` 新設（ISR）— プロフィール / 出演作品 / 監督作品 / 平均スコア
- [ ] `pages/company/[slug].tsx` 新設（ISR）— 概要 / 制作作品 / 配給作品
- [ ] PersonTemplate / CompanyTemplate の実装
- [ ] Breadcrumb 対応（Home > Person > Name / Home > Company > Name）
- [ ] SEO: entity ページを index 対象・内部リンクのハブ化・canonical 統一

#### Phase 3 — 完全移行（リダイレクト）
- [ ] `next.config.ts` に 301 リダイレクト追加
  - `/actor/:slug` → `/person/:slug`
  - `/director/:slug` → `/person/:slug`
  - `/production/:slug` → `/company/:slug`
  - `/distributor/:slug` → `/company/:slug`
- [ ] slug 固定・重複禁止の確認（移行後に変更禁止）
