# KatsumaScore 移行進捗 TODO

> フェーズ別実装チェックリスト
> 最終更新: 2026-04-26

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

### lib/api 基盤整備
- [x] `lib/api/wordpress/schema.ts` の作成（Zodバリデーション）
- [x] `lib/api/wordpress/transform.ts` の作成（transformPostを独立ファイルへ）
- [x] fetchにリトライ（2回）・タイムアウト（3秒）を実装

### ページ API 接続
- [x] `pages/index.tsx` のモックデータ→実APIデータへ置き換え（`getStaticProps` + ISR）
- [x] `pages/search.tsx` の新規作成（CSR + `searchPosts()`）
- [x] `pages/posts/[slug].tsx` に `getStaticPaths` を追加（ビルド時事前生成）

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

### コンポーネント整理
- [ ] CinemaCheck（`ui-section/CinemaCheck` は使用中、`features/CinemaCheck` wrapper は未接続）

### 未使用コンポーネントの整理
- [ ] `features/Pagination` — 未接続（ListTemplate等への接続またはui-section移行）
- [ ] `features/Carousel` — 完全未使用（削除または接続先の検討）
- [ ] `features/Post/PostDate` — 完全未使用（削除または接続先の検討）
- [ ] `features/VodPanel` — 完全未使用（`ui-section/VodPanel`との重複整理）
- [ ] `ui-layout/Container` — 完全未使用（削除または接続先の検討）
- [ ] `ui-parts/Badge` — 完全未使用
- [ ] `ui-parts/CTAButton` — 完全未使用
- [ ] `ui-parts/Category` — 完全未使用
- [ ] `ui-parts/VodLink` — 完全未使用
- [ ] `ui-parts/Affiliate/Admax` — 未使用（Tsutaya / Geo は AdRental で使用中）
- [ ] `ui-parts/Affiliate/Wowow` — 未使用
- [ ] `ui-section/ProductBlock` — 完全未使用（Gutenberg確認用途として保持か削除か要判断）

---

## 📋 今後の予定

### 品質・テスト（フェーズ 6）
- [ ] Vitest によるユニットテスト整備（`lib/api/` / `lib/utils/` 優先）
- [ ] ESLint ルールの `warn` → `error` 昇格
- [ ] Lighthouse スコア確認（Performance / SEO / A11y）

### 本番対応（フェーズ 7）
- [ ] WordPress 本番 API との接続確認（[手順・参照](docs/features/wordpress_production_api_verification.md) / [TODO チェックリスト](docs/features/wordpress_production_api_verification_checklist.md)）
- [ ] Cloudflare Workers デプロイの本番検証
- [ ] ISR Webhook設定（WordPress更新時にrevalidate）

### 公開後対応（フェーズ 8）
- [ ] 全コンポーネントに Storybook Story 作成
- [ ] 異常系 Story（NoImage / LongTitle / MixedData / Dense / Extreme）
- [ ] Lighthouse スコア確認（Performance / SEO / A11y）
- [ ] WordPress との表示比較（主要ページ）
- [ ] パフォーマンス最適化・アクセシビリティ対応
- [ ] 全 ui-parts に異常系 Story（LongTitle / NoImage / MixedData / Dense / Extreme）を追加
