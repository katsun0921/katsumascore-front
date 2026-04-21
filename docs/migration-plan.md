# WordPress → Next.js 移行プラン

> 対象: `katsumascore_wordpress_theme` → `katsumascore-front`（Next.js）
> 作成日: 2026-04-22
> 方針: WordPressはCMSのみ。Next.jsでフロントエンドを再設計する。

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

## フェーズ 1: lib/api 基盤整備

WordPress の生データをUIに渡さないための API 層を完成させる。

- [x] `lib/api/wordpress.ts` に全エンドポイント定義（getPosts / getPostBySlug / getCategories / getTags / searchPosts 等）
- [ ] `lib/api/wordpress.schema.ts` の作成（Zod によるレスポンスバリデーション）
- [ ] `lib/api/wordpress.transform.ts` の作成（`transformPost()` を独立ファイルへ分離）
- [ ] `lib/api/wordpress.types.ts` の作成（`WPPost` / `NormalizedPost` 等の型定義を集約）
- [x] `mapWPPostToPost()` で ACF フィールドを正規化（score / vod / isCinemaShowing 等）
- [x] Polylang 対応（`lang` パラメータ経由）
- [ ] fetch にリトライ（最大 2 回）・タイムアウト（3 秒）を実装
- [ ] `null` / 欠損を前提とした型設計の確認・修正

---

## フェーズ 2: ページ別 API 接続

各ページを実データに接続する。

### 2-1. ホームページ（`pages/index.tsx`）

- [x] `HomeTemplate` のコンポーネント実装
- [ ] `getStaticProps` でランダムタグ 3 件・各カテゴリ 6 件を取得
- [ ] モックデータ（`ui-home/mocks/home`）を実 API データに置き換え
- [ ] `revalidate: 3600` の ISR 設定

### 2-2. カテゴリアーカイブ（`pages/categories/[slug].tsx`）

- [x] `ListTemplate` のコンポーネント実装
- [x] `getStaticPaths` でカテゴリ一覧から動的パス生成
- [x] `getStaticProps` で該当カテゴリの記事を取得
- [x] ソート・フィルター機能（評価順 / 新着）

### 2-3. 記事詳細（`pages/posts/[slug].tsx`）

- [x] `PostDetail` テンプレートの実装
- [x] `getServerSideProps` で記事データ・関連記事を取得
- [x] ACF フィールド全対応（score / vod / isCinemaShowing / goodPoints 等）
- [ ] `getStaticProps` + `revalidate` への切り替え検討（現在 SSR）
- [ ] `getStaticPaths` の追加（ビルド時に主要記事を事前生成）

### 2-4. 検索ページ（`pages/search.tsx`）

- [ ] `pages/search.tsx` の新規作成
- [ ] `useRouter().query.s` でキーワード取得（CSR）
- [ ] `searchPosts()` を使用した `features/Search` コンポーネント接続
- [ ] 検索結果のローディング / エンプティステート表示

### 2-5. 404 ページ（`pages/404.tsx`）

- [x] `NotFoundTemplate` の実装
- [x] `pages/404.tsx` の作成

### 2-6. アーカイブリダイレクト対応

- [ ] `next.config.ts` に `/author/:slug` → `/404` リダイレクト追加
- [ ] 月別アーカイブ・タグアーカイブのリダイレクト設定

---

## フェーズ 3: SEO / メタデータ

- [ ] `next-seo` の導入
- [ ] 全ページに OGP / Twitter Card メタデータ対応（`head-social.php` 相当）
- [ ] JSON-LD 構造化データの実装（`schema.php` 相当）
- [ ] `next-sitemap` の設定（sitemap.xml / robots.txt 自動生成）
- [ ] slug の完全一致確認（WordPress ↔ Next.js）
- [ ] `canonical` URL の設定

---

## フェーズ 4: Storybook 品質確認

- [ ] 全 `ui-parts` コンポーネントに異常系 Story を追加
  - [ ] `LongTitle` — 長いタイトル
  - [ ] `NoImage` — サムネイルなし
  - [ ] `MixedData` — 欠損混在データ
  - [ ] `Dense`（10 件以上）
  - [ ] `Extreme`（20 件以上）
- [ ] `ui-section` コンポーネントの Story 整備
- [ ] `features` コンポーネントの Story 整備
- [ ] Storybook GitHub Pages への自動デプロイ確認（`release/v1` ブランチ）

---

## フェーズ 5: コンポーネント整理

重複・未整理のコンポーネントを解消する。

### features/ 内の整理

- [ ] `AdBanner` → 適切なレイヤーへ移動または削除
- [ ] `AdRental` → `ui-section/AdRental` との重複解消
- [ ] `Carousel` → `ui-parts/` または `ui-section/` に移動
- [ ] `CinemaCheck` → `ui-section/CinemaCheck` との重複解消
- [ ] `GenreNav` → `features/navigation/` に移動
- [ ] `OfficialSns` → `ui-parts/` または `ui-section/` に移動
- [ ] `PickUpAndScore` → 適切なレイヤーへ移動
- [ ] `ReviewSiteScores` → 適切なレイヤーへ移動
- [ ] `ScoreWithRank` → 適切なレイヤーへ移動
- [ ] `VodIntroduction` → `ui-section/` に移動

### ui-section/ 内の整理

- [ ] `Profile` → `features/` または `ui-section/` の適切な場所に移動
- [ ] `RelatedPosts` → `RelationPost` との重複確認・統合
- [ ] `SeoHead` → `features/` または `lib/` 相当に移動
- [ ] `PostListRow` コンポーネントの実装（`ui-section/` に新設）

### features/ サブディレクトリ整理

- [ ] `features/vod/` への整理（`VodMenu`, `VodPanel`, `VodItem` 等）
- [ ] `features/Post/PostVariants` の整備

---

## フェーズ 6: 品質・テスト

- [ ] Vitest によるユニットテスト整備（`lib/api/`, `lib/utils/` を優先）
- [ ] ESLint カスタムルール `katsumascore-ui/no-hardcoded-i18n` の全コンポーネント適用確認
- [ ] ESLint ルールの `warn` → `error` 昇格
- [ ] Lighthouse スコア確認（Performance / SEO / A11y）
- [ ] アクセシビリティ対応（ARIA 属性・キーボード操作）

---

## フェーズ 7: 本番対応

- [ ] WordPress 本番 API との接続確認（`WP_API_URL` 環境変数）
- [ ] Cloudflare Workers (OpenNext) デプロイの本番検証
- [ ] 広告コード（A8.net / admax）を `next/script` で管理
- [ ] Facebook ページ埋め込みの CSS クラス管理（`style` prop 禁止対応）
- [ ] パフォーマンス最適化（`next/image` 最適化・Code Splitting）
- [ ] ISR Webhook の設定（WordPress 更新時に revalidate）
- [ ] VOD ページは SSR のままとする確認

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
- `lib/api/wordpress.transform.ts` の `transformPost()` で正規化

---

## 移行非対象

以下は Next.js に移行しない。

- CSS / JS enqueue（Tailwind / SCSS で代替）
- コメント機能
- 月別アーカイブ
- 管理画面カスタマイズ
- ショートコード（ACF で代替）
