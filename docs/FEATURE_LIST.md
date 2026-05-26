# KatsumaScore フロントエンド 機能一覧

> v1.0 ― 2026年5月22日

---

## 目次

1. [ページ一覧](#1-ページ一覧)
2. [API エンドポイント](#2-api-エンドポイント)
3. [コンポーネント一覧](#3-コンポーネント一覧)
4. [ライブラリ関数](#4-ライブラリ関数)
5. [Hooks](#5-hooks)
6. [型定義](#6-型定義)
7. [i18n](#7-i18n)
8. [スタイリング・デザイントークン](#8-スタイリングデザイントークン)
9. [Storybook](#9-storybook)

---

## 1. ページ一覧

### 1.1 基本ページ

| ルート | ファイル | レンダリング | 説明 |
|--------|----------|------------|------|
| `/` | `pages/index.tsx` | ISR + Client fetch | ホームページ。パーソナライズはCSR |
| `/top` | `pages/top.tsx` | ISR | トップページ |
| `/about` | `pages/about.tsx` | SSG | About ページ |
| `/contact` | `pages/contact.tsx` | SSG | Contact フォーム |
| `/featured` | `pages/featured.tsx` | ISR | 特集ページ |
| `/privacy-policy` | `pages/privacy-policy.tsx` | SSG | プライバシーポリシー |
| `/search` | `pages/search.tsx` | CSR | 検索結果ページ |
| `/404` | `pages/404.tsx` | SSG | 404 エラーページ |

### 1.2 コンテンツアーカイブ

| ルート | ファイル | レンダリング | 説明 |
|--------|----------|------------|------|
| `/movie` | `pages/movie/index.tsx` | ISR | 映画一覧 |
| `/movie/page/[page]` | `pages/movie/page/[page].tsx` | ISR | 映画一覧ページング |
| `/anime` | `pages/anime/index.tsx` | ISR | アニメ一覧 |
| `/anime/page/[page]` | `pages/anime/page/[page].tsx` | ISR | アニメ一覧ページング |
| `/drama` | `pages/drama/index.tsx` | ISR | ドラマ一覧 |
| `/drama/page/[page]` | `pages/drama/page/[page].tsx` | ISR | ドラマ一覧ページング |

### 1.3 動的詳細ページ

| ルート | ファイル | レンダリング | 説明 |
|--------|----------|------------|------|
| `/[slug]` | `pages/[slug].tsx` | ISR | 記事詳細（キャッチオール） |
| `/actor/[slug]` | `pages/actor/[slug].tsx` | ISR | 配役詳細 |
| `/company/[slug]` | `pages/company/[slug].tsx` | ISR | 企業詳細 |
| `/franchise/[slug]` | `pages/franchise/[slug].tsx` | ISR | フランチャイズ詳細 |
| `/person/[slug]` | `pages/person/[slug].tsx` | ISR | 人物詳細 |

### 1.4 分類別ページ

| ルート | ファイル | レンダリング | 説明 |
|--------|----------|------------|------|
| `/genre/[slug]` | `pages/genre/[slug]/index.tsx` | ISR | ジャンル一覧 |
| `/genre/[slug]/p/[p]` | `pages/genre/[slug]/p/[p].tsx` | ISR | ジャンル一覧ページング |
| `/tag/[slug]` | `pages/tag/[slug]/index.tsx` | ISR | タグ一覧 |
| `/tag/[slug]/p/[p]` | `pages/tag/[slug]/p/[p].tsx` | ISR | タグ一覧ページング |

### 1.5 季節レビュー

| ルート | ファイル | レンダリング | 説明 |
|--------|----------|------------|------|
| `/seasonal-reviews` | `pages/seasonal-reviews/index.tsx` | ISR | 季節レビュー一覧 |
| `/seasonal-reviews/[slug]` | `pages/seasonal-reviews/[slug].tsx` | ISR | 季節レビュー詳細 |
| `/seasonal-anime-and-dramas-reviews` | `pages/seasonal-anime-and-dramas-reviews/index.tsx` | ISR | 季節アニメ＆ドラマレビュー一覧 |
| `/seasonal-anime-and-dramas-reviews/[slug]` | `pages/seasonal-anime-and-dramas-reviews/[slug].tsx` | ISR | 季節アニメ＆ドラマレビュー詳細 |

### 1.6 VOD 関連ページ

| ルート | ファイル | レンダリング | 説明 |
|--------|----------|------------|------|
| `/vod` | `pages/vod/index.tsx` | ISR | VOD サービス一覧 |
| `/vod/[slug]` | `pages/vod/[slug]/index.tsx` | SSR | VOD サービス詳細（在庫リアルタイム取得） |
| `/vod/[slug]/page/[page]` | `pages/vod/[slug]/page/[page].tsx` | SSR | VOD 配信記事ページング |

### 1.7 Sitemap

| ルート | ファイル | 説明 |
|--------|----------|------|
| `/sitemap.xml` | `pages/sitemap.xml.tsx` | クライアント側サイトマップ |
| `/server-sitemap.xml` | `pages/server-sitemap.xml.tsx` | サーバー側サイトマップ |

---

## 2. API エンドポイント

| エンドポイント | ファイル | 用途 |
|---------------|----------|------|
| `GET /api/hello` | `pages/api/hello.ts` | ヘルスチェック |
| `GET /api/search` | `pages/api/search.ts` | 記事検索（WP REST プロキシ） |
| `GET /api/actor-works` | `pages/api/actor-works.ts` | 配役関連作品取得 |
| `GET /api/vod-related` | `pages/api/vod-related.ts` | VOD 関連情報取得 |
| `GET /api/high-score` | `pages/api/high-score.ts` | 高スコア投稿取得 |
| `GET /api/category-filter-posts` | `pages/api/category-filter-posts.ts` | カテゴリフィルタ投稿取得 |
| `POST /api/revalidate` | `pages/api/revalidate.ts` | ISR Webhook（WordPress から呼び出し） |

---

## 3. コンポーネント一覧

### 3.1 ui-parts（純粋 UI・15 コンポーネント）

ロジック禁止。props の値を表示するのみ。

| コンポーネント | パス | 説明 |
|--------------|------|------|
| `Badge` | `components/ui-parts/Badge` | ラベル表示 |
| `Breadcrumb` | `components/ui-parts/Breadcrumb` | パンくずリスト UI |
| `CTAButton` | `components/ui-parts/CTAButton` | Call-to-Action ボタン |
| `HeaderNav` | `components/ui-parts/HeaderNav` | ヘッダーナビゲーション |
| `HighlightText` | `components/ui-parts/HighlightText` | テキストハイライト（XSS 安全） |
| `PostCard` | `components/ui-parts/PostCard` | 記事カード（Container / Body / Media / RankBadge / Skeleton） |
| `Score` | `components/ui-parts/Score` | スコア表示（1〜5） |
| `ScoreHexBadge` | `components/ui-parts/ScoreHexBadge` | 六角形スコアバッジ |
| `SearchResultItem` | `components/ui-parts/SearchResultItem` | 検索結果 1 件表示 |
| `ShareButtons` | `components/ui-parts/ShareButtons` | ソーシャルシェアボタン |
| `VideoEmbed` | `components/ui-parts/VideoEmbed` | YouTube / 動画埋め込み |
| `VodDots` | `components/ui-parts/VodDots` | VOD 配信状態インジケータ |
| `VodLink` | `components/ui-parts/VodLink` | VOD 配信リンク |
| `VodMenuItem` | `components/ui-parts/VodMenuItem` | VOD メニューアイテム |
| `Affiliate` | `components/ui-parts/Affiliate` | アフィリエイト広告（Admax / Geo / Tsutaya / Wowow） |

### 3.2 ui-layout（構造・4 コンポーネント）

ロジック禁止。children で構成。

| コンポーネント | パス | 説明 |
|--------------|------|------|
| `Container` | `components/ui-layout/Container` | コンテナレイアウト |
| `Footer` | `components/ui-layout/Footer` | フッター（多言語対応） |
| `Header` | `components/ui-layout/Header` | ヘッダー（多言語対応） |
| `Sidebar` | `components/ui-layout/Sidebar` | サイドバー |

### 3.3 ui-home（ホームページ専用・7 コンポーネント）

HomeTemplate からのみ参照。ロジック禁止。

| コンポーネント | パス | 説明 |
|--------------|------|------|
| `HomeCard` | `components/ui-home/HomeCard` | ホームカード |
| `HomeCardScrollList` | `components/ui-home/HomeCardScrollList` | カード横スクロールリスト |
| `HomeFeatured` | `components/ui-home/HomeFeatured` | 特集セクション |
| `HomeRanking` | `components/ui-home/HomeRanking` | ランキング表示 |
| `HomeRecommend` | `components/ui-home/HomeRecommend` | おすすめ表示 |
| `HomeVodFinder` | `components/ui-home/HomeVodFinder` | VOD 検索機能 |
| `HomeVodLegend` | `components/ui-home/HomeVodLegend` | VOD バッジ凡例（頭文字の意味を説明） |

### 3.4 ui-section（意味のある UI・23 コンポーネント）

props でデータを受け取る。読み取り専用 hooks（`useLocale` など）のみ許可。

| コンポーネント | パス | 説明 |
|--------------|------|------|
| `AdBanner` | `components/ui-section/AdBanner` | 広告バナー |
| `AdRental` | `components/ui-section/AdRental` | レンタル広告 |
| `CinemaCheck` | `components/ui-section/CinemaCheck` | 映画館チェック UI |
| `CinemaIntroduction` | `components/ui-section/CinemaIntroduction` | 映画館紹介 |
| `PostCard` (ImgLeft) | `components/ui-section/PostCard/PostCardImgLeft` | 記事カード（画像左） |
| `PostCard` (ImgOverlay) | `components/ui-section/PostCard/PostCardImgOverlay` | 記事カード（画像オーバーレイ） |
| `PostCard` (ImgTop) | `components/ui-section/PostCard/PostCardImgTop` | 記事カード（画像上） |
| `PostDate` | `components/ui-section/PostDate` | 投稿日時表示 |
| `PostDetailFranchises` | `components/ui-section/PostDetailFranchises` | 記事関連フランチャイズ |
| `PostContent` | `components/ui-section/PostPage/PostContent` | 記事本文 |
| `PostGoodPoint` | `components/ui-section/PostPage/PostGoodPoint` | おすすめポイント |
| `PostHero` | `components/ui-section/PostPage/PostHero` | 記事ヒーロー |
| `PostSection` | `components/ui-section/PostSection` | 投稿セクション |
| `ProductBlock` | `components/ui-section/ProductBlock` | 商品ブロック（WordPress ACF Gutenberg ブロック） |
| `Profile` | `components/ui-section/Profile` | プロフィール |
| `RelatedPosts` | `components/ui-section/RelatedPosts` | 関連記事 |
| `RelationPost` | `components/ui-section/RelationPost` | 関連投稿 |
| `StreamingVod` | `components/ui-section/StreamingVod` | ストリーミング配信情報 |
| `VodIntroduction` | `components/ui-section/VodIntroduction` | VOD 紹介 |
| `VodItem` | `components/ui-section/VodItem` | VOD アイテム |
| `VodPanel` | `components/ui-section/VodPanel` | VOD パネル |

### 3.5 features（ロジック・18 コンポーネント）

hooks / state 使用可。データ取得・整形を担当。

| コンポーネント | パス | 説明 |
|--------------|------|------|
| `AdRental` | `components/features/AdRental` | 広告レンタル（ロジック） |
| `Breadcrumbs` | `components/features/Breadcrumbs` | パンくずナビ |
| `CinemaCheck` | `components/features/CinemaCheck` | 映画館チェック（ロジック） |
| `GenreNav` | `components/features/GenreNav` | ジャンルナビゲーション（アイコン付き） |
| `HomeHero` | `components/features/HomeHero` | ホームヒーローセクション |
| `OfficialSns` | `components/features/OfficialSns` | 公式 SNS 表示 |
| `Pagination` | `components/features/Pagination` | ページネーション（多言語対応） |
| `PickUpAndScore` | `components/features/PickUpAndScore` | 特選＋スコア表示 |
| `ListFilterBar` | `components/features/Post/ListFilterBar` | リストフィルターバー |
| `PostHeader` | `components/features/Post/PostHeader` | 投稿ヘッダー |
| `PostRankingItem` | `components/features/Post/PostRankingItem` | ランキングアイテム |
| `PostTitleMeta` | `components/features/Post/PostTitleMeta` | タイトル＋メタ（配役情報） |
| `PostsGroup` | `components/features/Post/PostsGroup` | 複数投稿グループ |
| `TableOfContents` | `components/features/Post/TableOfContents` | 目次自動生成 |
| `RelationPost` | `components/features/RelationPost` | 関連投稿（ロジック） |
| `ReviewSiteScores` | `components/features/ReviewSiteScores` | 外部レビューサイトスコア |
| `ScoreWithRank` | `components/features/ScoreWithRank` | スコア＋ランク（SS/S/A/B/C） |
| `Search` | `components/features/Search` | インクリメンタル検索（ヘッダードロップダウン） |
| `SearchBox` | `components/features/SearchBox` | 検索ボックス |
| `StreamingVod` | `components/features/StreamingVod` | ストリーミング配信（ロジック） |
| `VodMenu` | `components/features/VodMenu` | VOD メニュー |
| `SeoHead` | `components/features/seo/SeoHead` | SEO 用 `<head>` メタタグ |

### 3.6 templates（画面構造・12 テンプレート）

`PageLayout` でラップ必須。

| テンプレート | パス | 説明 |
|------------|------|------|
| `PageLayout` | `components/templates/PageLayout` | ページレイアウト基盤 |
| `HomeTemplate` | `components/templates/HomeTemplate` | ホームページ |
| `ListTemplate` | `components/templates/ListTemplate` | 映画 / アニメ / ドラマ一覧 |
| `PostDetail` | `components/templates/PostDetail` | 記事詳細 |
| `FranchiseTemplate` | `components/templates/FranchiseTemplate` | フランチャイズ詳細（Hero / CTA / Highlights / PostList / Timeline） |
| `PersonTemplate` | `components/templates/PersonTemplate` | 人物詳細 |
| `AboutTemplate` | `components/templates/AboutTemplate` | About ページ |
| `CompanyTemplate` | `components/templates/CompanyTemplate` | 企業ページ |
| `ContactTemplate` | `components/templates/ContactTemplate` | Contact フォーム |
| `PrivacyPolicyTemplate` | `components/templates/PrivacyPolicyTemplate` | プライバシーポリシー |
| `SearchResultTemplate` | `components/templates/SearchResultTemplate` | 検索結果 |
| `NotFoundTemplate` | `components/templates/NotFoundTemplate` | 404 ページ |

---

## 4. ライブラリ関数

### 4.1 WordPress API クライアント（`src/libs/api/wordpress/`）

| ファイル | 内容 |
|---------|------|
| `client.ts` | openapi-fetch ベースの WP REST API クライアント |
| `schema.ts` | API スキーマ定義 |
| `transform.ts` | レスポンス変換・正規化 |
| `lang.ts` | ACF `lang` フィールドによる言語判定ロジック |

**エンドポイント関数（`endpoints/`）**

| ファイル | 主要関数 | 説明 |
|---------|---------|------|
| `posts.ts` | `getPosts`, `getPostBySlug`, `getRelatedPosts`, `searchPosts` | 投稿取得 |
| `pages.ts` | `getPage`, `getPageBySlug` | 固定ページ取得 |
| `categories.ts` | `getCategories`, `getCategoriesForArchiveResolve`, `getPostsByCategory` | カテゴリ取得 |
| `tags.ts` | `getTags`, `getPostsByTag` | タグ取得 |
| `genre.ts` | `getGenres`, `getPostsByGenre` | ジャンル取得 |
| `companies.ts` | `getCompanies`, `getCompanyBySlug` | 企業取得 |
| `persons.ts` | `getPersons`, `getPersonBySlug` | 人物取得 |
| `franchise.ts` | `getFranchises`, `getFranchiseBySlug` | フランチャイズ取得 |
| `vodTaxonomy.ts` | `getVodTaxonomy` | VOD 分類取得 |

**共通仕様:**
- ベース URL: `process.env.WP_API_URL`
- 全リクエストに `_embed&acf_format=standard` を付与
- エラー時は `null` を返す（`try/catch`）

### 4.2 記事詳細データ構築（`src/libs/buildPostDetailFromWp/`）

WP API レスポンスから詳細ページ用データを組み立てる。

| ファイル | 内容 |
|---------|------|
| `buildPostDetail.ts` | メイン変換関数 |
| `acfScalars.ts` | ACF フィールド解析 |
| `titleMeta.ts` | タイトル・メタ情報 |
| `creditsActors.ts` | 配役情報 |
| `goodPoints.ts` | おすすめポイント |
| `cinema.ts` | 映画館情報 |
| `officialSns.ts` | 公式 SNS |
| `reviewSiteScores.ts` | 外部レビュースコア |
| `streamingRental.ts` | ストリーミング・レンタル情報 |
| `vodIntroduction.ts` | VOD 紹介 |
| `postsGroup.ts` | 関連投稿グループ |
| `relationPostIds.ts` | 関連投稿 ID |
| `youtube.ts` | YouTube 情報 |

### 4.3 ページロード関数（`src/libs/`）

| 関数 | ファイル | 説明 |
|------|---------|------|
| `loadPostDetailPage` | `loadPostDetailPage.ts` | 記事詳細ページのデータロード |
| `loadGenreListPage` | `loadGenreListPage.ts` | ジャンル一覧ページのデータロード |
| `loadTagListPage` | `loadTagListPage.ts` | タグ一覧ページのデータロード |
| `loadCategoryListPage` | `loadCategoryListPage.ts` | カテゴリ一覧ページのデータロード |
| `loadVodArchivePage` | `loadVodArchivePage.ts` | VOD アーカイブページのデータロード |

### 4.4 ユーティリティ関数（`src/libs/` / `src/utils/`）

| 関数 / ファイル | 説明 |
|---------------|------|
| `homeStaticProps.ts` | ホームページ静的 props 生成 |
| `getStaticGenres.ts` | ジャンル静的パス生成 |
| `listFilters.ts` | リストフィルタロジック |
| `buildVodFinderItems.ts` | VOD 検索アイテム構築 |
| `scoreDisplay.ts` | スコア表示ロジック |
| `searchRelevance.ts` | 検索スコアリング |
| `route.ts` | ルーティングユーティリティ |
| `nextLinkLocale.ts` | Next.js Link 言語対応 |
| `publicAssetUrl.ts` | 公開アセット URL 生成 |
| `toc.ts` | 目次（TableOfContents）生成 |
| `vod.ts` | VOD 関連ユーティリティ |
| `vodPathToWpSlug.ts` | VOD パス → WP スラッグ変換 |
| `seasonalReviewParent.ts` | 季節レビュー親スラッグ解決 |
| `wpMockMode.ts` | WP モックモード制御 |
| `formatDate.ts` (utils) | 日付フォーマット |
| `normalizePost.ts` (utils) | 投稿データ正規化（`normalizePosts` / `mapWPPostToPost`） |
| `ranking.ts` (utils) | スコア → ランク変換（`getScoreRank`: 1〜5 → C/B/A/S/SS） |
| `toSerializableValue.ts` (utils) | `getStaticProps` 用シリアライズ変換 |

### 4.5 キャッシュ（`src/libs/cache/`）

| ファイル | 説明 |
|---------|------|
| `version.ts` | キャッシュバージョン管理 |

---

## 5. Hooks

| Hook | ファイル | 説明 |
|------|---------|------|
| `useHighScorePosts` | `src/hooks/useHighScorePosts.ts` | 高スコア投稿データ取得（Client fetch） |
| `useVodRelatedPosts` | `src/hooks/useVodRelatedPosts.ts` | VOD 関連投稿データ取得（Client fetch） |
| `useLayout` | `src/hooks/useLayout.ts` | レイアウト状態管理 |
| `useCategoryFilterPosts` | `src/libs/useCategoryFilterPosts.ts` | カテゴリフィルタ投稿取得 |
| `useCategoryPagedPosts` | `src/libs/useCategoryPagedPosts.ts` | カテゴリページド投稿取得 |
| `useLocale` | `src/i18n/provider.tsx` | 現在のロケール取得 |

---

## 6. 型定義（`src/types/`）

| ファイル | 主要型 |
|---------|-------|
| `post.ts` | `Post`, `PostTaxonomy`, `FilterPost`, `PostContentData` |
| `wordpress.ts` | WordPress REST API・ACF フィールド型 |
| `franchise.ts` | `Franchise` 関連型 |
| `search.ts` | `SearchResult`, `SearchDimension` |
| `css.d.ts` | CSS Module 型定義 |

---

## 7. i18n

### 構成（`src/i18n/`）

| ファイル | 役割 |
|---------|------|
| `provider.tsx` | `I18nProvider` + `useLocale()` hook |
| `t.ts` | `t(messages, path[], locale)` 翻訳関数。missing 時に `console.warn` |
| `topPageMessages.ts` | トップページ翻訳メッセージ |
| `searchPageMessages.ts` | 検索ページ翻訳メッセージ |
| `vodPageMessages.ts` | VOD ページ翻訳メッセージ |

### 対応言語

| コード | 言語 | 判定方法 |
|--------|------|---------|
| `ja` | 日本語 | ACF `lang` フィールド |
| `en` | 英語 | ACF `lang` フィールド |

### ルール（フェーズ 1）

- i18n はコンポーネント内に閉じる
- メッセージはコンポーネント配下の `i18n.ts` に定義する
- キーは UI 構造ベースで命名する（例: `cta.watch`）

---

## 8. スタイリング・デザイントークン

### 技術スタック

| 対象 | 技術 |
|------|------|
| pages / ui-parts / ui-layout / templates | Tailwind CSS v4 |
| features / ui-section / ui-home | SCSS（コンポーネントスコープ） |

### デザイントークン（`src/styles/tokens/`・`globals.css`）

- **カラー**: CSS 変数 `--color-*`（HEX 定義）
- **フォント**: CSS 変数 `--font-*`、`--font-size-*`
- **ブレークポイント**: `@theme` で一元管理（Tailwind プレフィックス `sm:` / `md:` / `lg:` で参照）
- **スペーシング**: Tailwind spacing tokens のみ（`0/1/2/3/4/5/6/8/10/12`）

### ブレークポイント生成

`scripts/generate-breakpoints.mjs` で `src/styles/generated/` に自動生成。

---

## 9. Storybook

### 概要

| 項目 | 内容 |
|------|------|
| ストーリー総数 | 82 個 |
| バージョン | Storybook 10 |
| ビルダー | Vite（`@storybook/react-vite`） |
| テスト | `@storybook/addon-vitest`（ブラウザテスト） |

### モック（`.storybook/mocks/`）

| ファイル | 内容 |
|---------|------|
| `nextImage.tsx` | `next/image` モック |
| `nextLink.tsx` | `next/link` モック |
| `nextRouter.tsx` | `next/router` モック |

### Storybook 専用コンポーネント

| コンポーネント | パス | 説明 |
|--------------|------|------|
| `ProjectOverview` | `components/storybook/ProjectOverview` | プロジェクト概要ドキュメント |
| `DesignRules` | `components/storybook/DesignRules` | デザインルール可視化 |
| `Typography` | `components/typography/Typography` | タイポグラフィ・カラートークン展示 |

### locale 切り替え

Storybook toolbar（globe アイコン）で `ja` / `en` のリアルタイム切り替えが可能。

---

## 関連ドキュメント

| ドキュメント | 場所 | 内容 |
|------------|------|------|
| アーキテクチャ設計書 | `docs/ARCHITECTURE.md` | フレームワーク選定・技術スタック・WordPress 統合 |
| コンポーネント設計 | `.claude/rules/src/components.md` | レイヤー定義・index.ts ルール |
| スタイリング | `.claude/rules/styling.md` | Tailwind / SCSS 使い分け |
| libs 仕様 | `.claude/rules/src/libs.md` | ライブラリ関数仕様 |
| i18n 実装 | `.claude/rules/src/components/i18n-implementation.md` | i18n 設計・フェーズ構成 |
| Entity 実装仕様 | `docs/ENTITY_IMPLEMENTATION_SPEC.md` | Entity 設計 |
