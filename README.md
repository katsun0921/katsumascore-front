# KatsumaScore フロントエンド

映画・アニメ・ドラマのスコアレビューサイト「KatsumaScore」のフロントエンドリポジトリ。
WordPress をデータソースとし、Next.js (Pages Router) で再設計されたフロントエンドです。

---

## 技術スタック

| 用途 | 技術 |
|---|---|
| フレームワーク | Next.js 15 (Pages Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 / SCSS (features のみ) |
| UI カタログ | Storybook 8 |
| デプロイ | Cloudflare Workers (OpenNext) |
| CMS | WordPress (REST API) |

---

## 開発環境のセットアップ

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリが起動します。

### Storybook 起動

```bash
npm run storybook
```

**[http://localhost:6006](http://localhost:6006)** で Storybook が起動します。

> 公開済み Storybook (GitHub Pages):
> **https://katsun0921.github.io/katsumascore-front/**

---

## コマンド一覧

```bash
npm run dev              # 開発サーバー
npm run build            # Next.js ビルド
npm run storybook        # Storybook 開発サーバー (port 6006)
npm run build-storybook  # Storybook 静的ビルド → storybook-static/
npm run lint             # ESLint
npm run lint:scss        # Stylelint
npm run deploy           # Cloudflare Workers へデプロイ
```

---

## ディレクトリ構成

```
src/
├── components/
│   ├── ui-parts/          # 純粋UI（props表示のみ・hooks/state禁止）
│   │   ├── Badge/
│   │   ├── Breadcrumb/
│   │   ├── CTAButton/
│   │   ├── Score/
│   │   ├── ScoreHexBadge/
│   │   ├── PostCard/      # Container / Media / Body / Skeleton
│   │   └── ...
│   ├── ui-layout/         # 構造（配置・骨格）
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Container/
│   │   └── Sidebar/
│   ├── ui-section/        # 意味を持つUIまとまり
│   │   ├── PostCard/      # ImgTop / ImgLeft / ImgOverlay
│   │   ├── PostList/
│   │   └── PostSection/
│   ├── ui-home/           # HomeTemplate 専用（HomeTemplate からのみ参照）
│   │   ├── HomeCard/
│   │   ├── HomeCardScrollList/
│   │   ├── HomeRanking/
│   │   ├── HomeVodFinder/
│   │   ├── HomeSeasonReview/
│   │   ├── HomeRecommend/
│   │   ├── HomeFeatured/
│   │   └── mocks/
│   ├── features/          # ドメインロジックを持つ機能コンポーネント
│   │   ├── navigation/    # HeaderNav / HamburgerMenu
│   │   ├── search/        # Search / SearchBox
│   │   ├── Post/          # PostCard / PostContent / PostDate 等
│   │   ├── StreamingVod/
│   │   ├── RelationPost/
│   │   └── Pagination/
│   └── templates/         # ページ組み立て
│       ├── HomeTemplate/
│       ├── ListTemplate/
│       ├── PostDetail/
│       ├── NotFoundTemplate/
│       └── PageLayout/
├── lib/
│   ├── vod.ts             # VODサービス共通定数（ラベル・カラー・イニシャル）
│   └── api/               # WordPress REST API クライアント
│       └── wordpress.ts
├── pages/                 # Next.js ページ
│   ├── index.tsx          # TOPページ（現在モックデータ使用中）
│   ├── posts/[slug].tsx   # 記事詳細（実API接続済み）
│   ├── categories/[slug].tsx  # カテゴリアーカイブ（実API接続済み）
│   └── 404.tsx
├── styles/
│   └── globals.css        # デザイントークン（CSS変数・ブレークポイント）
└── types/
```

---

## コンポーネント設計

### TOPページ (HomeTemplate)

モックデザイン（`mocks/`）をもとに以下のセクションで構成されています。

| コンポーネント | 役割 |
|---|---|
| `HomeHero` | Featuredレビュー Hero（Hexスコア + VODバッジ + CTA） |
| `HomeRanking` | TOP 10 ランキングリスト |
| `HomeCardScroll` | 横スクロールカードグリッド（最新・高評価・注目アニメ） |
| `HomeVodFinder` | VODサービス別の作品リンク |
| `HomeSeasonReview` | シーズン別レビューリンク |
| `HomeRecommend` | ジャンルタグ付きおすすめセクション |
| `HomeFeatured` | 特集カードグリッド |

**DOM順はSPファースト。** PCレイアウトへの変更はCSSのみ（`grid-column` / `order`）で行い、DOMの二重管理は禁止です。

### VODサービス共通定数

`src/lib/vod.ts` にサービスキー・表示名・カラー変数・イニシャルを一元管理しています。
コンポーネント内でのローカル定義は禁止です。

```ts
import { VOD_LABEL, VOD_COLOR_VAR, VOD_INITIAL } from '@/lib/vod';
```

---

## スタイリング方針

| レイヤー | 技術 |
|---|---|
| `pages` / `layout` / `templates` / `ui` | Tailwind CSS |
| `features` | SCSS（コンポーネントスコープ） |

- カラーは必ず CSS 変数を使用（`var(--color-*)`）。HEX 直書き禁止
- ブレークポイントは `globals.css` の `@theme` で一元管理
- スペーシングは Design Token 内の値のみ（arbitrary value 禁止）

---

## Storybook

各コンポーネントには以下のバリアントを含む Story を作成しています。

- `Default` — 通常状態
- `LongTitle` / `NoImage` — 欠損・エッジケース
- `Dense` (10件以上) / `Extreme` (20件以上) — 負荷テスト

**ローカル:** [http://localhost:6006](http://localhost:6006)
**公開済み:** [https://katsun0921.github.io/katsumascore-front/](https://katsun0921.github.io/katsumascore-front/)

`release/v1` ブランチへの push で GitHub Actions が自動ビルド・デプロイします。

---

## デプロイ

Cloudflare Workers (OpenNext) を使用しています。

```bash
npm run deploy
```

---

## ドキュメント

| ドキュメント | 内容 |
|---|---|
| [CLAUDE.md](./CLAUDE.md) | 設計規約・レイヤー構成・スタイリング方針 |
| [docs/migration-plan.md](./docs/migration-plan.md) | WordPress → Next.js 移行プラン（フェーズ別 TODO） |
| [docs/archive/wordpress-to-nextjs-migration.md](./docs/archive/wordpress-to-nextjs-migration.md) | WordPress → Next.js 移行手順（アーカイブ・2026-04 実装完了時点） |
| [docs/features/vod_personalization_design.md](./docs/features/vod_personalization_design.md) | VODパーソナライズ & 通知機能設計 |

---

## 移行進捗

フェーズ別の詳細 TODO: [docs/migration-plan.md](./docs/migration-plan.md)

---

### ✅ 完了済み

#### 基盤整備
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

#### ui-parts / ui-layout / ui-section / ui-home
- [x] Badge / Breadcrumb / CTAButton / Category / Score / ScoreHexBadge / SearchResultItem / ShareButtons / VideoEmbed / VodDots / VodLink / VodMenuItem
- [x] PostCard 基礎部品（Container / Media / Body / Skeleton）
- [x] Header / Footer / Container / Sidebar（ui-layout）
- [x] PostCard（ImgTop / ImgLeft / ImgOverlay）/ PostList / PostSection（ui-section）
- [x] HomeCard / HomeCardScrollList / HomeFeatured / HomeRanking / HomeRecommend / HomeSeasonReview / HomeVodFinder（ui-home）

#### features / templates / pages
- [x] Post / PostCard / PostContent / PostDate / PostHeader / PostTitleMeta / TableOfContents
- [x] navigation / HeaderNav / HamburgerMenu
- [x] Search / SearchBox / Pagination / RelationPost / VodMenu / StreamingVod
- [x] PageLayout / HomeTemplate / ListTemplate / PostDetail / NotFoundTemplate
- [x] `pages/posts/[slug].tsx`（記事詳細・実API接続済み）
- [x] `pages/categories/[slug].tsx`（カテゴリアーカイブ・実API接続済み）
- [x] `pages/404.tsx`

---

### 🚧 作業中（フェーズ 1-2）

#### lib/api 基盤整備
- [x] `lib/api/wordpress/schema.ts` の作成（Zodバリデーション）
- [x] `lib/api/wordpress/transform.ts` の作成（transformPostを独立ファイルへ）
- [x] fetchにリトライ（2回）・タイムアウト（3秒）を実装

#### ページ API 接続
- [x] `pages/index.tsx` のモックデータ→実APIデータへ置き換え（`getStaticProps` + ISR）
- [x] `pages/search.tsx` の新規作成（CSR + `searchPosts()`）
- [x] `pages/posts/[slug].tsx` に `getStaticPaths` を追加（ビルド時事前生成）

#### コンポーネント整理
- [ ] `features/` 内の重複・未整理コンポーネントの移行（AdRental / CinemaCheck / GenreNav等）
  - [ ] AdRental
  - [ ] CinemaCheck
  - [ ] GenreNav
- [ ] `ui-section/` 内の整理（Profile / RelatedPosts / SeoHead）
  - [ ] Profile
  - [x] RelatedPosts
  - [x] SeoHead

---

### 📋 今後の予定（フェーズ 3-7）

#### SEO / メタデータ（フェーズ 3）
- [x] `next-seo` 導入（v7: JSON-LD専用）・全ページOGP / Twitter Card対応
- [x] JSON-LD構造化データの実装（Product + review + aggregateRating + BreadcrumbList）
- [x] Google Analytics（GA4）・Google AdSenseの実装（`next/script` / 本番環境のみ / 多言語対応）
- [x] サイトマップの実装（`/sitemap.xml`・`/server-sitemap.xml` / 動的ルート対応・ja/en両ロケール）
- [x] `robots.txt` の設定

#### 品質・テスト（フェーズ 6）
- [ ] Vitest によるユニットテスト整備（`lib/api/` / `lib/utils/` 優先）
- [ ] ESLint ルールの `warn` → `error` 昇格
- [ ] Lighthouse スコア確認（Performance / SEO / A11y）

#### 本番対応（フェーズ 7）
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
