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
