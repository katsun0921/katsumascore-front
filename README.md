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
│   ├── features/          # ドメインロジックを持つ機能コンポーネント
│   │   ├── home/          # TOPページ専用セクション
│   │   │   ├── HomeHero/
│   │   │   ├── HomeRanking/
│   │   │   ├── HomeCardScroll/
│   │   │   ├── HomeVodFinder/
│   │   │   ├── HomeSeasonReview/
│   │   │   ├── HomeRecommend/
│   │   │   ├── HomeFeatured/
│   │   │   └── mocks/
│   │   ├── Post/          # 記事関連コンポーネント群
│   │   └── Sidebar/       # サイドバー用コンポーネント群
│   ├── ui/                # 汎用UIコンポーネント（ドメイン非依存）
│   ├── layout/            # Header / Footer / Sidebar 構造
│   └── templates/         # ページ組み立て
│       └── HomeTemplate/
├── lib/
│   ├── vod.ts             # VODサービス共通定数（ラベル・カラー・イニシャル）
│   └── api/               # WordPress REST API クライアント
├── pages/                 # Next.js ページ
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

## 設計ドキュメント

詳細な設計規約・移行ガイドは [CLAUDE.md](./CLAUDE.md) を参照してください。

---

## 進捗チェックリスト

### ✅ 完了済み

#### 基盤整備
- [x] Next.js 15 (Pages Router) / TypeScript / Tailwind CSS v4 の初期設定
- [x] Storybook 8 のセットアップ（i18n toolbar、decorator 含む）
- [x] i18n 基盤の構築（`I18nProvider`, `t()` 関数、コンポーネントローカル `i18n.ts`）
- [x] ESLint カスタムルール（`katsumascore-ui/no-hardcoded-i18n` 等）
- [x] Stylelint 設定
- [x] Husky によるコミットフック
- [x] Cloudflare Workers (OpenNext) デプロイ設定
- [x] WordPress REST API クライアント（`lib/api/wordpress.ts`）
- [x] レイヤー設計の確立（`ui-parts / ui-layout / ui-section / ui-home / features / templates`）

#### レイヤー名の統一・移行
- [x] `components/ui/` → `components/ui-parts/` へリネーム統一
- [x] `components/features/home/` → `components/ui-home/` への移行
- [x] `components/layout/` → `components/ui-layout/` への移行
- [x] `components/ui-layout/Header/` の新設（ナビゲーション整理）
- [x] `Grid` コンポーネントの削除（Tailwind で代替）

#### ui-parts コンポーネント
- [x] Badge
- [x] Breadcrumb（i18n 対応）
- [x] CTAButton（i18n 対応）
- [x] Category
- [x] Score
- [x] ScoreHexBadge
- [x] SearchResultItem
- [x] ShareButtons（i18n 対応）
- [x] VideoEmbed
- [x] VodDots
- [x] VodLink
- [x] VodMenuItem
- [x] PostCard 基礎部品（PostCardContainer / PostCardMedia / PostCardBody / PostCardSkeleton）

#### ui-layout コンポーネント
- [x] Header
- [x] Footer
- [x] Container
- [x] Sidebar

#### ui-section コンポーネント
- [x] PostCard（ImgTop / ImgLeft / ImgOverlay）
- [x] PostList
- [x] PostSection
- [x] ProductBlock（WordPress ACF ブロック確認用）

#### ui-home コンポーネント（HomeTemplate 専用）
- [x] HomeCard
- [x] HomeCardScrollList
- [x] HomeFeatured
- [x] HomeRanking
- [x] HomeRecommend
- [x] HomeSeasonReview
- [x] HomeVodFinder

#### features コンポーネント
- [x] Post / PostCard（PostCardImgLeft / ImgTop / ImgOverlay）
- [x] Post / PostContent
- [x] Post / PostDate
- [x] Post / PostHeader
- [x] Post / PostTitleMeta
- [x] Post / TableOfContents
- [x] navigation / HeaderNav
- [x] navigation / HamburgerMenu
- [x] Search / SearchBox
- [x] Pagination
- [x] RelationPost
- [x] VodMenu
- [x] StreamingVod

#### テンプレート・ページ
- [x] PageLayout（Header / Footer ラップ）
- [x] HomeTemplate
- [x] ListTemplate（i18n 対応・フィルターオプション）
- [x] PostDetail
- [x] NotFoundTemplate
- [x] pages/index.tsx（TOP ページ）
- [x] pages/posts/（記事一覧・記事詳細）
- [x] pages/categories/（カテゴリ一覧）
- [x] pages/404.tsx

---

### 🚧 作業中

- [ ] `features/` 内の未整理コンポーネントの移行・整理
  - [ ] `AdBanner` → 適切なレイヤーへ移動または削除
  - [ ] `AdRental` → `ui-section/AdRental` との重複を解消
  - [ ] `Carousel` → `ui-parts/` または `ui-section/` に移動
  - [ ] `CinemaCheck` → `ui-section/CinemaCheck` との重複を解消
  - [ ] `GenreNav` → `features/navigation/` に移動
  - [ ] `HomeHero` → 削除済みを確認・後処理
  - [ ] `OfficialSns` → `ui-parts/` または `ui-section/` に移動
  - [ ] `PickUpAndScore` → 適切なレイヤーへ移動
  - [ ] `ReviewSiteScores` → 適切なレイヤーへ移動
  - [ ] `ScoreWithRank` → 適切なレイヤーへ移動
  - [ ] `VodIntroduction` → `ui-section/` に移動
- [ ] `ui-section/` 内の未整理コンポーネントの整理
  - [ ] `Profile` → `features/` または `ui-section/` の適切な場所に移動
  - [ ] `RelatedPosts` → `RelationPost` との重複を確認・統合
  - [ ] `SeoHead` → `features/` または `lib/` 相当に移動
- [ ] README を現在のアーキテクチャに合わせて更新（ディレクトリ構成セクション）

---

### 📋 今後の予定

#### アーキテクチャ完成
- [ ] `features/vod/` サブディレクトリへの整理（`VodMenu`, `VodPanel`, `VodItem` 等）
- [ ] `PostListRow` コンポーネントの実装（`ui-section/` に新設）
- [ ] `features/Post/PostVariants` の整備
- [ ] ディレクトリ単一コンポーネントルールの全面適用・検証

#### Storybook 整備
- [ ] 全 ui-parts コンポーネントに異常系 Story（LongTitle / NoImage / MixedData）を追加
- [ ] Dense（10件以上）/ Extreme（20件以上）Story の追加
- [ ] Storybook GitHub Pages への自動デプロイ確認（`release/v1` ブランチ）

#### 品質・テスト
- [ ] Vitest によるユニットテストの整備
- [ ] ESLint カスタムルールの `warn` → `error` 昇格
- [ ] `no-hardcoded-i18n` の全コンポーネント適用確認

#### 本番対応
- [ ] WordPress 本番 API との接続確認
- [ ] Cloudflare Workers デプロイの本番検証
- [ ] OGP / Twitter Card メタデータの完全対応
- [ ] パフォーマンス最適化（Image 最適化・Code Splitting）
- [ ] アクセシビリティ対応（ARIA 属性・キーボード操作）
