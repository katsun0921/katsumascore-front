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
| [Todo.md](./docs/features/MigrationNextjsTodo.md) | 移行進捗 TODO（フェーズ別チェックリスト） |
| [docs/archive/wordpress-to-nextjs-migration.md](./docs/archive/wordpress-to-nextjs-migration.md) | WordPress → Next.js 移行手順（アーカイブ・2026-04 実装完了時点） |
| [docs/features/vod_personalization_design.md](./docs/features/vod_personalization_design.md) | VODパーソナライズ & 通知機能設計 |
| [docs/features/franchise_acf_design.md](./docs/features/franchise_acf_design.md) | Franchise（シリーズ）ACF設計 ― リニューアル後施策 |
| [docs/features/wpgraphql-acf-evaluation.md](./docs/features/wpgraphql-acf-evaluation.md) | WPGraphQL for ACF 導入評価（現リリース見送り・カスタムポストタイプ追加時に再検討） |

---

## 移行進捗

詳細なフェーズ別 TODO: [Todo.md](./docs/features/MigrationNextjsTodo.md)

---

## リニューアル後 TODO

### taxonomy 見直し（actor / director）

リニューアル時点では `actor` / `director` / `company` を taxonomy として運用するが、将来的には entity（CPT）への移行を予定。

| 現状 URL | 将来 URL |
|---|---|
| `/ja/actor/{slug}` | `/ja/person/{slug}` |
| `/ja/director/{slug}` | `/ja/person/{slug}` |

- slug は変更しない（301 リダイレクトで吸収）
- 移行タイミングは CPT 導入後に別途判断する
- 詳細設計: [ディレクトリ / URL / データ設計まとめ](./docs/katsumascore_directory_strategy.md)
## 今後の予定

### カスタムポストタイプの追加

現在は映画・アニメ・ドラマを単一のポストタイプで管理しているが、以下のカスタムポストタイプの追加を予定している。

| ポストタイプ | 内容 |
|---|---|
| VOD | 配信サービスごとの在庫・料金情報 |
| フランチャイズ | シリーズ・シーズンのグループ管理 |
| アクター | 俳優・声優の情報と出演作品の関連付け |

### WPGraphQL for ACF への移行検討

カスタムポストタイプの追加に伴い ACF フィールドの種類と複雑度が増加するタイミングで、
WordPress REST API から **WPGraphQL for ACF** への移行を検討する。

主な改善効果:
- 一覧ページでの `content` 過剰取得の解消
- 詳細ページの関連記事取得を単一 GraphQL クエリに統合
- ACF フィールドの型を GraphQL スキーマから自動生成（Zod の手動メンテ削減）

詳細: [docs/features/wpgraphql-acf-evaluation.md](./docs/features/wpgraphql-acf-evaluation.md)
