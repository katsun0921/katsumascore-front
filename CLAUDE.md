# KatsumaScore WordPressテーマ → Next.js 移行実装ガイド

> **v1.1** ― スタイリング仕様・ローカル開発環境追加  
> 参照テーマ: [github.com/katsun0921/katsumascore_wordpress_theme](https://github.com/katsun0921/katsumascore_wordpress_theme)  
> 2026年3月30日

---

## 1. テーマ構造の分析

### 1.1 既存デザインシステム

WordPressテーマのデザインシステムは `katsumascore_design_system` で管理されており、SCSSとReact/TypeScriptで構成されている。Next.js移行後はこのリポジトリのSCSS構造・コンポーネント設計を**参照・移植**してkatsumascore-front内のStorybookを構築する。

| 項目 | 現行（WordPress） | Next.js移行後 |
|---|---|---|
| リポジトリ | katsumascore_wordpress_theme | katsumascore-front（新規） |
| デザインシステム | katsumascore_design_system | 同パッケージを移植 |
| CSSソース | src/scss/（SCSS + BEM） | Storybookコンポーネント用SCSSとして継承 |
| Storybook | npm run storybook（katsumascore_design_system内） | katsumascore-frontの `.storybook/`（ルート）に移植。v9.1.5・React Vite |
| フォント（本文） | Noto Sans JP | next/font/google → Noto Sans JP |
| フォント（見出し） | Shippori Mincho | next/font/google → Shippori Mincho |
| 命名規則 | BEM | Storybookコンポーネント内でBEMを継続 |

### 1.2 PHPテンプレート → Next.jsルート対応表

| PHPテンプレート | 役割 | 対応Next.jsルート |
|---|---|---|
| index.php | 記事一覧 | pages/index.tsx |
| single.php | 記事詳細 | pages/posts/[slug].tsx |
| archive.php | アーカイブ一覧 | pages/category/[slug].tsx |
| page-home.php | ホームページ | pages/index.tsx |
| page-featured-article.php | 特集記事ページ | pages/featured.tsx |
| page-seasonal-anime-and-dramas-reviews.php | 季節アニメレビュー | pages/seasonal.tsx |
| 404.php | 404エラー | pages/404.tsx |
| search.php | 検索結果 | pages/search.tsx |
| sidebar.php | サイドバー | components/layout/Sidebar.tsx |
| header.php | ヘッダー | components/layout/Header.tsx |
| footer.php | フッター | components/layout/Footer.tsx |

### 1.3 ACFカスタムフィールド一覧

| ACFフィールド名 | 型 | 用途 | REST API取得パス |
|---|---|---|---|
| `review_score` | number（1〜5） | レビュースコア | `post.acf.review_score` |
| `title_jp` | text | 日本語タイトル | `post.acf.title_jp` |
| `title_en` | text | 英語タイトル | `post.acf.title_en` |
| `acf_summary_group` | group | あらすじグループ | `post.acf.acf_summary_group` |
| `actors_filed` | repeater | キャスト情報 | `post.acf.actors_filed` |
| `release_date` | text（Ymd形式） | リリース日 | `post.acf.release_date` |
| `good_point_filed` | textarea | オススメポイント | `post.acf.good_point_filed` |
| `official_url` | url | 公式サイトURL | `post.acf.official_url` |
| `official_sns` | url | 公式SNSリンク | `post.acf.official_sns` |
| `streaming_vod_netflix` | true_false | Netflix配信フラグ | `post.acf.streaming_vod_netflix` |
| `streaming_vod_amazon` | true_false | Amazon Prime配信フラグ | `post.acf.streaming_vod_amazon` |
| `streaming_vod_unext` | true_false | U-NEXT配信フラグ | `post.acf.streaming_vod_unext` |
| `is_cinema_showing` | true_false | 劇場公開中（VOD非表示） | `post.acf.is_cinema_showing` |

---

## 2. スタイリング仕様

### 2.1 基本方針

スタイリングはNext.jsとStorybookで**完全に分離**して管理する。両者でスタイル技術を混在させない。

| 層 | スタイル技術 | 対象 |
|---|---|---|
| Next.jsページ・レイアウト | **Tailwind CSS v4のみ** | ページ全体・余白・グリッド・色・タイポグラフィ |
| Storybookコンポーネント | **SCSSのみ（Tailwind不使用）** | ReviewScore・VodBadge・PostCardなど固有デザインが必要なコンポーネント |

> ⚠️ StorybookコンポーネントにTailwindクラスを使用しない。StorybookはSCSSのみで完結させる。`katsumascore_design_system` の `src/scss/` のBEM設計・SCSS構造を継承する。

### 2.2 Tailwindを使う場面（Next.jsのみ）

| カテゴリ | 対象箇所 | Tailwindクラス例 |
|---|---|---|
| レイアウト | ページ全体・コンテナ・グリッド | `container mx-auto`, `grid grid-cols-3`, `flex gap-4` |
| タイポグラフィ | 本文・見出し・日付 | `text-base text-gray-800`, `text-2xl font-bold` |
| 余白・サイズ | セクション間・カード内パディング | `mt-12`, `p-4`, `w-full`, `max-w-2xl` |
| 色・背景 | 背景色・ボーダー・テキスト色 | `bg-gray-50`, `border border-gray-200` |
| レスポンシブ | モバイルファースト | `md:grid-cols-2`, `lg:grid-cols-3` |
| ホバー・フォーカス | リンク・ボタンの基本状態変化 | `hover:text-purple-600`, `focus:outline-none` |

### 2.3 SCSSを使う場面（Storybookのみ）

| コンポーネント | SCSS管理の理由 | Storyバリエーション |
|---|---|---|
| Score | 六角形clip-path・$scoreBackground/$scoreBackgroundBorderによる色・サイズ変化 | Score1, Score3, Score5, SizeMedium, SizeLarge |
| VodBadge | 各サービスのブランドカラー・劇場公開バッジの条件表示 | Netflix, Amazon, UNEXT, Cinema, All, None |
| PostCard | サムネイル比率・ホバーエフェクト・スコアオーバーレイ | Default, WithScore, Featured, NoImage |
| Header | ナビゲーション・言語切り替え・モバイルドロワー | Desktop, Mobile, JA, EN |
| Breadcrumbs | 区切り文字・省略表示・階層表現 | Home, Category, Post, Long |
| Sharing | 各SNSのブランドカラー・コピー完了アニメーション | Default, Copied |

### 2.4 フォント設定

```ts
// pages/_app.tsx
import { Noto_Sans_JP, Shippori_Mincho } from 'next/font/google'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
})

const shipporiMincho = Shippori_Mincho({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-heading',
})
```

```ts
// tailwind.config.ts
theme: {
  extend: {
    fontFamily: {
      body: ['var(--font-body)', 'sans-serif'],
      heading: ['var(--font-heading)', 'serif'],
    }
  }
}
```

### 2.5 スコアランクシステム

`inc/get-ranking-icon.php` の `get_ranking_icon($value)` をTypeScriptに移植する。  
`katsumascore_design_system` の `Score` コンポーネントはスコア `'1'|'2'|'3'|'4'|'5'` の5段階で実装されている。

| スコア | ランク | SCSSクラス | 色（$scoreBackground） |
|---|---|---|---|
| 5 | SS | `c-score c-score__large` | `$scoreBackground`（紫系） |
| 4 | S | `c-score c-score__large` | 同上 |
| 3 | A | `c-score c-score__medium` | 同上 |
| 2 | B | `c-score c-score__medium` | 同上 |
| 1 | C | `c-score c-score__medium` | 同上 |

> 💡 SCSSのスコア色は `src/scss/global/variable/_colors.scss` の `$scoreBackground`（`rgb(41 15 72)`）と `$scoreBackgroundBorder`（`rgb(200 5 229)`）で定義されている。Next.jsページ内でTailwindクラスを使う場合は `text-purple-900` 系に対応させる。

### 2.6 既存SCSSからの移行方針

| 移行方針 | 対象 | 手順 |
|---|---|---|
| SCSSをStorybookコンポーネントとして継承 | ReviewScore・VodBadge等の固有スタイル | 既存BEMブロックのSCSSをコンポーネントスコープのSCSSファイルとして移植 |
| Next.jsページはTailwindで新規実装 | レイアウト・余白・グリッド等 | 既存SCSSは参照のみ。Tailwindクラスで書き直す |
| 共有変数・トークンはSCSS変数で管理 | カラー・フォントサイズ・ブレークポイント | `src/scss/global/variable/_colors.scss` に切り出しStorybookのSCSSからimport |

> 💡 SCSSはStorybookコンポーネントの中だけで完結させる。Next.jsのpagesやlayoutコンポーネントにはSCSSを持ち込まずTailwindのみを使う。

---

## 3. Next.jsプロジェクト構成

### 3.1 ディレクトリ構造

```
katsumascore-front/
├── pages/
│   ├── _app.tsx              # フォント・グローバルCSS設定
│   ├── index.tsx             # トップ（記事一覧）
│   ├── 404.tsx
│   ├── search.tsx
│   ├── featured.tsx
│   ├── seasonal.tsx
│   ├── posts/[slug].tsx      # 記事詳細（single.php相当）
│   ├── category/[slug].tsx   # カテゴリーアーカイブ
│   └── api/
│       ├── vod.ts            # VOD在庫API（SSR）
│       └── revalidate.ts
├── components/
│   ├── layout/               # ← Tailwindで基本スタイル
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── post/                 # ← SCSSは src/scss/object/ で管理
│   │   ├── PostCard.tsx      # Storybook（SCSS）管理 ※別リポジトリ
│   │   ├── PostContent.tsx   # Tailwind（prose）
│   │   ├── ReviewScore.tsx   # Storybook（SCSS）管理 ※別リポジトリ
│   │   ├── VodBadge.tsx      # Storybook（SCSS）管理 ※別リポジトリ
│   │   ├── RelatedPosts.tsx
│   │   └── Breadcrumbs.tsx   # Storybook（SCSS）管理 ※別リポジトリ
│   └── ui/                   # shadcn/ui（Tailwindベース）
├── .storybook/               # Storybook設定（プロジェクトルート）
│   ├── main.ts               # stories glob・addons・vite設定
│   └── preview.ts            # SCSSグローバル変数の設定
├── src/
│   ├── stories/              # ストーリーファイル（design_systemの構成を踏襲）
│   │   ├── components/       # 汎用コンポーネント
│   │   │   ├── Score/        # Score.tsx + Score.stories.tsx + _score.scss
│   │   │   ├── Category/
│   │   │   ├── Tag/
│   │   │   └── ...
│   │   ├── layouts/          # レイアウト系
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/
│   │   │   ├── Navigation/
│   │   │   ├── Sharing/
│   │   │   └── Post/
│   │   └── projects/         # ページ単位の複合コンポーネント
│   │       ├── Post/         # PostTopImage・PostLeftImage・PostOverlay
│   │       ├── Info/
│   │       ├── Content/
│   │       └── Summary/
│   └── scss/                 # SCSSソース（design_systemのsrc/scssを踏襲）
│       ├── global/
│       │   ├── variable/
│       │   │   ├── _colors.scss      # カラー変数（viteのadditionalDataで自動注入）
│       │   │   └── _fontWeight.scss
│       │   └── mixin/
│       │       ├── _screens.scss
│       │       └── _animation.scss
│       ├── foundation/               # リセット・ベース
│       ├── layout/                   # header・footer・sidebar等
│       └── object/
│           ├── component/            # score・button・category等
│           ├── project/              # post・info・content等
│           └── utility/              # margin・padding・display等
├── styles/
│   └── globals.css           # Tailwind @import + カスタム変数
├── lib/
│   ├── wordpress.ts          # WP REST APIクライアント
│   ├── vod.ts                # Cloudflare KVアクセス
│   └── ranking.ts            # スコアランク関数（PHPから移植）
├── types/
│   └── wordpress.ts          # WP/ACF型定義
├── .env.local                # ローカル開発用（Gitにコミットしない）
├── .env.example              # テンプレート（Gitにコミットする）
└── wrangler.jsonc
```

> 💡 `storybook/` ディレクトリにStorybookに関するものをすべて集約する。`.storybook/`（設定）・`stories/`（ストーリー）・`scss/`（コンポーネントSCSS）の3つをこのディレクトリ配下で管理する。

### 3.2 Storybook設定

`katsumascore_design_system` の設定を踏襲する。SCSSのカラー変数はviteの `additionalData` で**全SCSSに自動注入**されるため、各SCSSファイルで個別に `@use` する必要はない。

```ts
// .storybook/main.ts
import { resolve } from 'path'
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@whitespace/storybook-addon-html',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: [{ from: '../public/', to: '/' }],
  viteFinal: async (config) => {
    config.resolve = config.resolve ?? {}
    config.resolve.alias = {
      '@': resolve(__dirname, '../src'),
      '@/scss': resolve(__dirname, '../src/scss'),
      '@/assets': resolve(__dirname, '../src/assets'),
    }
    // SCSSカラー変数を全SCSSに自動注入（design_systemと同じ方式）
    config.css = {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/scss/global/variable/_colors.scss" as *; @use "@/scss/global/variable/_fontWeight.scss" as *;`,
        },
      },
    }
    return config
  },
}
export default config
```

```ts
// .storybook/preview.ts
import type { Preview } from '@storybook/react'
// ❌ globals.css（Tailwind）は読み込まない
// ✅ SCSSはviteのadditionalDataで自動注入済みのため個別importも不要

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#FFFFFF' },
        { name: 'dark', value: '#111827' },
      ],
    },
  },
}
export default preview
```

**package.json scripts（`--config-dir` 不要・ルート配置）**

```json
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build"
```

**コンポーネントのSCSS importパターン（design_systemを踏襲）**

```tsx
// src/stories/components/Score/Score.tsx
import React from 'react'
import '@/scss/object/component/_score.scss'  // SCSSを直接import
import '@/scss/object/utility/index.scss'

export const Score = ({ score }: { score: '1'|'2'|'3'|'4'|'5' }) => (
  <div className="c-score c-score__medium">
    <span className="c-score__count">{score}</span>
  </div>
)
```

> 💡 **design_systemとの関係**  
> `katsumascore_design_system`（[別リポジトリ](https://github.com/katsun0921/katsumascore_design_system)）は引き続きWordPressテーマのデザイン管理に使用する。  
> katsumascore-frontのStorybookは同リポジトリのSCSS構造・コンポーネント設計を**参照・移植**して構築する。

### 3.3 型定義（types/wordpress.ts）

```ts
export interface WPPost {
  id: number
  slug: string
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
  date: string
  featured_media: number
  _embedded?: { 'wp:featuredmedia': [{ source_url: string }] }
  acf?: {
    review_score?: 1 | 2 | 3 | 4 | 5
    title_jp?: string
    title_en?: string
    acf_summary_group?: { summary_jp?: string; summary_en?: string }
    actors_filed?: { name: string; role?: string }[]
    release_date?: string           // Ymd形式
    good_point_filed?: string
    official_url?: string
    official_sns?: string
    streaming_vod_netflix?: boolean
    streaming_vod_amazon?: boolean
    streaming_vod_unext?: boolean
    is_cinema_showing?: boolean
  }
}

export type ScoreRank = 'SS' | 'S' | 'A' | 'B' | 'C'

// ACFのreview_scoreは1〜5の整数
// design_systemのScore コンポーネントに合わせて '1'|'2'|'3'|'4'|'5' を使用
export function getScoreRank(score: 1|2|3|4|5): ScoreRank {
  if (score === 5) return 'SS'
  if (score === 4) return 'S'
  if (score === 3) return 'A'
  if (score === 2) return 'B'
  return 'C'
}
```

---

## 4. ローカル開発環境

### 4.1 構成概要

ローカル開発はLocalWPでWordPressを起動し、Next.jsの開発サーバーからREST APIを叩く構成で行う。本番環境（Cloudflare Workers + ConoHa Wing）との差異は環境変数で吸収する。

```
[ ローカル開発環境 ]

  LocalWP（localwp.com）
  http://localhost:8080             ← WordPress管理画面・REST API
  http://localhost:8080/wp-json/wp/v2
         │
         │ WP REST API（ローカル）
         ↓
  Next.js 開発サーバー
  http://localhost:3000             ← フロントエンド（npm run dev）
  http://localhost:6006             ← Storybook（npm run storybook）
  http://localhost:8787             ← Workers確認（npm run preview）

[ 本番環境（参考）]

  ConoHa Wing: admin.katsumascore.blog  ← WordPress
  Cloudflare Workers: katsumascore.blog ← Next.js
```

### 4.2 環境変数の設定

```bash
# .env.local（ローカル開発用・Gitにコミットしない）
WP_API_URL=http://localhost:8080/wp-json/wp/v2
NEXT_PUBLIC_WP_BASE_URL=http://localhost:8080
```

```bash
# .env.example（Gitにコミットする・テンプレート共有用）
WP_API_URL=http://localhost:8080/wp-json/wp/v2
NEXT_PUBLIC_WP_BASE_URL=http://localhost:8080
```

```bash
# 本番の値はGitHub Secretsで管理（.env.productionは作成しない）
# WP_API_URL=https://admin.katsumascore.blog/wp-json/wp/v2
```

> ⚠️ `.env.local` は絶対にGitにコミットしない。`.gitignore` に `*.local` が含まれていることを確認する。

### 4.3 LocalWPのセットアップ

| 手順 | 内容 | 備考 |
|---|---|---|
| 1 | LocalWP（localwp.com）をインストール | macOS版を使用 |
| 2 | 新規サイトを作成 | サイト名: katsumascore-local |
| 3 | WordPressのポートを8080に設定 | Site > Advanced > Web Server でポート変更 |
| 4 | 本番WordPressのデータをエクスポート | All-in-One WP Migration等で `.wpress` ファイルを書き出し |
| 5 | LocalWPにインポート | 同プラグインでローカルにインポート |
| 6 | Polylang Pro・ACF Proをローカルで有効化 | ライセンスはローカル環境向けに確認 |
| 7 | REST APIの動作確認 | `http://localhost:8080/wp-json/wp/v2/posts` でJSONが返ることを確認 |

### 4.4 LocalWP CORSの設定

ローカルのNext.js（localhost:3000）からLocalWP（localhost:8080）へのリクエストにはCORS設定が必要な場合がある。LocalWPのWordPressの `functions.php` に以下を追加する。

```php
// functions.php（ローカル開発用CORS設定）
add_action('init', function () {
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  $allowed = [
    'http://localhost:3000',      // Next.js開発サーバー
    'http://localhost:8787',      // Wrangler（Workers確認）
    'https://katsumascore.blog',  // 本番
  ];
  if (in_array($origin, $allowed)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
  }
});
```

> 💡 本番の `functions.php` にはlocalhostのoriginを含めない。本番はConoHa Wing上のWordPressで管理する。

### 4.5 開発コマンド一覧

| コマンド | 用途 | アクセス先 |
|---|---|---|
| `npm run dev` | Next.js開発サーバー起動 | http://localhost:3000 |
| `npm run storybook` | Storybookサーバー起動 | http://localhost:6006 |
| `npm run preview` | Workersランタイムでのローカル確認 | http://localhost:8787 |
| `npm run build` | 本番ビルド確認 | ビルドエラーの事前チェック |
| `npm run deploy` | Cloudflare Workersへ本番デプロイ | katsumascore.blog |

> 💡 `npm run preview`（wrangler dev）は本番Workersランタイムを再現したローカル環境。`/api/vod` 等のAPIルートの動作確認は `npm run dev` ではなく `npm run preview` で行う。

### 4.6 環境別チェックリスト

#### ローカル開発時

- [ ] `http://localhost:8080/wp-json/wp/v2/posts` にアクセスしJSONが返る
- [ ] `http://localhost:3000` でNext.jsのトップページが表示される
- [ ] 記事一覧にLocalWPの記事が表示される
- [ ] `npm run storybook` を実行し http://localhost:6006 が起動する（``）
- [ ] ReviewScore・VodBadge・PostCardのSCSSスタイルが正しく表示される

#### Workersランタイム確認時（npm run preview）

- [ ] `http://localhost:8787` でWorkerとして動作する
- [ ] `/api/vod?slug=test-post` が正しくレスポンスを返す
- [ ] KVバインディング（`VOD_CACHE`）が機能する

#### 本番デプロイ前

- [ ] `.env.local` のURLがlocalhostになっていないことを確認
- [ ] GitHub SecretsのWP_API_URLが本番URLに設定済みであることを確認
- [ ] `npm run build` がエラーなく完了する

---

## 5. AIプロンプト集

以下のプロンプトをClaude Code（またはCursor）に順番に投入する。各プロンプト冒頭に**共通ルール**を付与すること。

---

### 共通ルール（全プロンプトに付与する前提）

```
## スタイリングルール（全コンポーネント共通）
- Next.jsのページ・レイアウトコンポーネントは Tailwind CSS v4 のみ使用
- StorybookコンポーネントはSCSSのみ使用（Tailwindは使用しない）
- StorybookコンポーネントにTailwindクラスを書かない
- SCSSの命名規則はBEM（Block__Element--Modifier）
- SCSS変数は src/scss/global/variable/_colors.scss で共有管理
- インラインスタイルは使用しない
- Next.js側のclassName結合はclsxを使用: import clsx from 'clsx'

## Storybookルール
- ストーリーファイルは src/stories/・SCSSは src/scss/・設定は .storybook/ に配置する
- ストーリーファイル: src/stories/{ComponentName}.stories.tsx
- コンポーネントSCSS: src/scss/object/component/_{componentName}.scss
- Storybook設定: .storybook/ （プロジェクトルート）
- Storyは必ず複数バリエーションを用意する（最低3パターン）

## プロジェクト仕様
- フレームワーク: Next.js 15（Pages Router。App Routerは使用しない）
- 言語: TypeScript
- デプロイ: Cloudflare Workers（@opennextjs/cloudflare）
- WP REST API: process.env.WP_API_URL
- ローカルWP: http://localhost:8080（LocalWP）
- 多言語: Polylang（?lang=ja / ?lang=en）
```

---

### プロンプト 1：プロジェクトセットアップ

以下の仕様でNext.js 15のプロジェクトをセットアップしてください。

**1. create-next-app の実行**

```bash
npx create-next-app@latest katsumascore-front
```

CLIの質問には以下のように回答する:

| 質問 | 回答 | 理由 |
|---|---|---|
| What is your project named? | `katsumascore-front` | |
| Would you like to use TypeScript? | **Yes** | 型安全 |
| Would you like to use ESLint? | **Yes（ESLint）** | |
| Would you like to use Tailwind CSS? | **Yes** | Next.jsページのスタイリングに使用 |
| Would you like your code inside a `src/` directory? | **Yes** | pages/をルート直下に置く |
| Would you like to use App Router? | **No** | Pages Routerを使用 |
| Would you like to use Turbopack for `next dev`? | **Yes** | Next.js 15でstable・高速HMR |
| Would you like to customize the import alias? | **No** | デフォルト（@/）のまま |
| Would you like to use React Compiler? | **No** | 下記参照 |
| Would you like to include AGENTS.md? | **No** | 下記参照 |

> ⚠️ **React CompilerをNoにする理由**
> - React CompilerはApp Router + React 19を前提に設計されており、Pages Routerとの組み合わせは公式に非推奨
> - 2026年時点ではまだRC（Release Candidate）段階のため本番環境への採用は時期尚早
> - 将来App Routerへ移行するタイミングで改めて検討する

> 💡 **AGENTS.mdをNoにする理由**
> - 移行ガイド（本ドキュメント）を `CLAUDE.md` としてプロジェクトルートに配置するため役割が完全に重複する
> - Claude Codeは `CLAUDE.md` を自動読み込みするため、AGENTS.mdは不要
> - スタイリングルール・環境変数・プロンプト集はすべて `CLAUDE.md` に集約して一元管理する

**2. 追加パッケージのインストール**

```bash
npm install @opennextjs/cloudflare html-react-parser clsx
# katsumascore_design_systemと同バージョンに合わせる（v9.1.5）
npm install -D sass \
  @storybook/react-vite@^9.1 storybook@^9.1 \
  @storybook/addon-links @storybook/addon-docs \
  @whitespace/storybook-addon-html
```

**3. wrangler.jsonc を作成**

```jsonc
{
  "name": "katsumascore",
  "compatibility_date": "2026-03-30",
  "compatibility_flags": ["nodejs_compat"]
}
```

**4. 残りの設定**

- `styles/globals.css` にTailwindのディレクティブを設定（Next.js用）
- `src/scss/global/variable/_colors.scss` と `_fontWeight.scss` を作成
  （vite `additionalData` で全SCSSに自動注入 → 各SCSSで個別 `@use` 不要）
- `.storybook/main.ts` でpath alias（`@` → `src/`）とadditionalDataを設定
- `tailwind.config.ts` にフォント変数を登録: `fontFamily: { body: ['var(--font-body)'], heading: ['var(--font-heading)'] }`
- `pages/_app.tsx` でNoto Sans JP + Shippori Mincho（next/font/google）を設定
- `lib/ranking.ts` に `getScoreRank` 関数を作成（C/B/A/S/SSランク判定）
- `.env.local` を作成（Gitにコミットしない）
- `.env.example` を作成（Gitにコミットする）

```bash
# .env.local
WP_API_URL=http://localhost:8080/wp-json/wp/v2
NEXT_PUBLIC_WP_BASE_URL=http://localhost:8080
```

**5. package.json に scripts を追加**

```json
"preview": "opennextjs-cloudflare build && wrangler dev",
"deploy": "opennextjs-cloudflare build && wrangler deploy",
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build"
```

---

### プロンプト 2：WP REST APIクライアント

```
lib/wordpress.ts を作成してください。

## 実装する関数
- getPosts(params?: { page?: number; per_page?: number; lang?: string; category?: number })
- getPostBySlug(slug: string, lang?: string)
- getCategories(lang?: string)
- getPostsByCategory(categoryId: number, lang?: string)
- getRelatedPosts(ids: number[])
- searchPosts(query: string, lang?: string)

## 仕様
- ベースURL: process.env.WP_API_URL
  （ローカル: http://localhost:8080/wp-json/wp/v2）
  （本番: https://admin.katsumascore.blog/wp-json/wp/v2）
- 全リクエストに _embed&acf_format=standard を付与（ACF + アイキャッチ画像取得）
- Polylang言語指定: ?lang=ja または ?lang=en
- エラー時は null を返す（try/catch）
- 型定義は types/wordpress.ts の WPPost を使用
```

---

### プロンプト 3：Scoreコンポーネント（design_system踏襲・SCSSのみ）

```
katsumascore_design_systemの Score コンポーネントを参考に、
src/stories/components/Score/Score.tsx と Score.stories.tsx を作成してください。
SCSSは src/scss/object/component/_score.scss に記述します。

## design_systemでの実装（参照）
- スコアは '1'|'2'|'3'|'4'|'5' の5段階
- BEMクラス: .c-score / .c-score__medium / .c-score__large / .c-score__count
- 六角形のclip-path形状（$blockClipPath）
- 色: $scoreBackground / $scoreBackgroundBorder（_colors.scssで定義済み・自動注入）

## Props
interface ScoreProps {
  score: '1' | '2' | '3' | '4' | '5'
  size?: 'medium' | 'large'
}

## スタイル仕様
- スタイルはすべて src/scss/object/component/_score.scss に記述（Tailwind不使用）
- SCSSのBEM命名はdesign_systemの .c-score を継承
- カラー変数（$scoreBackground等）はvite additionalDataで自動注入済みのため @use 不要
- コンポーネント内で直接SCSSをimport: import '@/scss/object/component/_score.scss'

## Storyバリエーション
- Score1（最低）, Score3（中）, Score5（最高）, SizeMedium, SizeLarge
```

---

### プロンプト 4：VodBadgeコンポーネント（Storybook・SCSSのみ）

```
components/post/VodBadge.tsx と src/stories/VodBadge.stories.tsx を作成してください。
SCSSは src/scss/object/component/_vodbadge.scss に記述します。

## Props
interface VodBadgeProps {
  netflix?: boolean
  amazon?: boolean
  unext?: boolean
  isCinema?: boolean     // trueなら「劇場公開中」バッジのみ表示
}

## スタイル仕様
- スタイルはすべて src/scss/object/component/_vodbadge.scss に記述（Tailwind不使用）
- SCSSのBEM命名: .vod-badge / .vod-badge__item--netflix 等
- src/scss/global/variable/_colors.scss の変数を @use でimport
- 各サービスのブランドカラー（SCSS変数）:
  $color-netflix: #E50914 / $color-amazon: #00A8E1 / $color-unext: #000000
- falseのサービスは非表示（条件レンダリング）
- 劇場公開中（isCinema=true）: VODバッジ非表示・「劇場公開中」バッジのみ

## Storyバリエーション
- AllAvailable, OnlyNetflix, OnlyAmazon, OnlyUnext,
  Cinema（VOD非表示）, NoneAvailable
```

---

### プロンプト 5：記事詳細ページ（single.php移植）

```
pages/posts/[slug].tsx を作成してください。
WordPressテーマの single.php を参考に同じページ構成を再現します:
https://github.com/katsun0921/katsumascore_wordpress_theme/blob/main/single.php

## ページ構成（single.phpの表示順序を維持）
1. タイトル（title_jp / title_en ― useRouter().locale で切り替え）
2. 投稿日付（release_date ACFフィールド。なければdateを使用）
3. 記事本文（PostContent: html-react-parserで描画）
4. ReviewScore（acf.review_score がある場合のみ）
5. サイドバー（Sidebar）
6. 関連記事ID指定（acf.relationship フィールド）
7. VODバッジ（isCinema=falseの場合のみ VodBadge を表示）
8. レンタルサービス（locale=ja かつ isCinema=false の場合のみ）
9. 関連記事（タグ/カテゴリー/シリーズ）
10. シェアボタン（Sharing）

## getServerSideProps
- WP REST APIからslug + locale で記事取得
  （ローカル: http://localhost:8080/wp-json/wp/v2）
- VOD在庫は /api/vod?slug={slug} をfetch（同一Worker内）
- Props: { post: WPPost; vod: VodResponse; locale: string }

## スタイル
- ページ全体レイアウト・余白: Tailwind
- ReviewScore・VodBadge: 各StorybookコンポーネントをimportしてそのままNext.jsページに配置
```

---

### プロンプト 6：PostCardコンポーネント（Storybook・SCSSのみ）

```
components/post/PostCard.tsx と src/stories/PostCard.stories.tsx を作成してください。
SCSSは src/scss/object/component/_postcard.scss に記述します。

## Props
interface PostCardProps {
  post: WPPost
  locale?: string
  variant?: 'default' | 'featured' | 'compact'
}

## スタイル仕様
- スタイルはすべて src/scss/object/component/_postcard.scss に記述（Tailwind不使用）
- SCSSのBEM命名: .post-card / .post-card__thumbnail / .post-card--featured 等
- src/scss/global/variable/_colors.scss の変数を @use でimport
- サムネイル比率: 512x512（add_image_size 'index' に合わせる）
- ホバーエフェクト・スコアオーバーレイはSCSSアニメーションで実装
- タイトルは locale に応じて title_jp / title_en を切り替え

## Storyバリエーション
- Default, Featured（大きいカード）, Compact（一覧用小）,
  WithScore, WithVod, NoImage, JA, EN
```

---

### プロンプト 7：VOD在庫APIルート

```
pages/api/vod.ts を作成してください。

## エンドポイント
GET /api/vod?slug={post-slug}

## レスポンス型
interface VodResponse {
  netflix: boolean
  amazon: boolean
  unext: boolean
  is_cinema: boolean
  updated_at: string | null
}

## データ取得の優先順位
1. Cloudflare KV（バインディング名: VOD_CACHE）から取得
2. KVに存在しない場合: WP REST APIのACFフィールドから取得
3. 両方失敗: 全フラグfalseで返す（サービス継続優先）

## wrangler.jsonc に追加する設定
[[kv_namespaces]]
binding = "VOD_CACHE"
id = "{your-kv-namespace-id}"
```

---

### プロンプト 8：多言語対応（Polylang → next-i18next）

```
Polylang Proの多言語機能をNext.jsで再現してください。

## next.config.ts に追加
i18n: { locales: ['ja', 'en'], defaultLocale: 'ja' }

## 実装
1. lib/wordpress.ts の全関数にlangパラメーターを自動付与
2. lib/i18n.ts にヘルパー関数を作成:
   - getLocalizedTitle(post: WPPost, locale: string): string
   - getLocalizedSummary(post: WPPost, locale: string): string
3. useRouter().locale で言語取得
4. 言語切り替えリンク: /ja/posts/{slug} ⇔ /en/posts/{slug}

## ポイント
- WP REST API: ?lang=ja または ?lang=en（Polylang対応）
  （ローカル: http://localhost:8080/wp-json/wp/v2?lang=ja）
- 日本語デフォルト（/posts/{slug}）、英語は /en/posts/{slug}
- HeaderのStorybookコンポーネントに言語切り替えUI（JA/ENストーリー）を追加
```

---

### プロンプト 9：GitHub Actions CI/CD

```
.github/workflows/deploy.yml を作成してください。

## トリガー
- mainブランチへのpush
- workflow_dispatch（手動実行）

## ステップ
1. actions/checkout@v4
2. actions/setup-node@v4（Node.js 20）
3. npm ci
4. opennextjs-cloudflare build
5. wrangler deploy（cloudflare/wrangler-action@v3）

## GitHub Secrets
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID
- WP_API_URL: https://admin.katsumascore.blog/wp-json/wp/v2
  （本番URL。ローカルのlocalhost:8080ではないことに注意）
```

---

## 6. 実装チェックリスト

### 6.1 セットアップ

- [x] Next.js 15プロジェクト作成（Pages Router）
- [x] @opennextjs/cloudflare + wrangler.jsonc 設定
- [x] Tailwind CSS v4 設定（フォント変数含む）
- [x] フォント設定（Noto Sans JP + Shippori Mincho）
- [x] `sass` と Storybook パッケージを devDependencies に追加
- [x] `lib/ranking.ts` 作成（1〜5 → SS/S/A/B/Cランク変換）
- [x] `types/wordpress.ts` 作成（全ACFフィールドの型定義）
- [x] `lib/wordpress.ts` 作成（APIクライアント・ベースURLは`.env.local`参照）
- [x] `.env.local` 作成（`WP_API_URL=http://localhost:8080/wp-json/wp/v2`）
- [x] `.env.example` 作成（Gitにコミット）

### 6.2 Storybookコンポーネント

**components/（TSX）**
- [x] src/stories/components/Score/Score.tsx + src/scss/object/component/_score.scss
- [x] components/post/VodBadge.tsx
- [ ] components/post/PostCard.tsx
- [x] components/layout/Header.tsx
- [ ] components/post/Breadcrumbs.tsx
- [x] components/post/Sharing.tsx

**src/stories/（ストーリーファイル・design_systemの構成を踏襲）**
- [x] ReviewScore.stories.tsx
- [x] VodBadge.stories.tsx
- [ ] PostCard.stories.tsx
- [x] Header.stories.tsx
- [ ] Breadcrumbs.stories.tsx
- [x] Sharing.stories.tsx

**src/scss/（コンポーネントSCSS・design_systemから移植）**
- [x] src/scss/global/variable/_colors.scss（vite additionalDataで自動注入）
- [x] ReviewScore.scss
- [x] VodBadge.scss
- [ ] PostCard.scss
- [x] Header.scss
- [ ] Breadcrumbs.scss
- [x] Sharing.scss

### 6.3 ページ実装（Tailwindで基本スタイル）

- [x] pages/_app.tsx（フォント・グローバルCSS）
- [x] pages/index.tsx（記事一覧）
- [ ] pages/posts/[slug].tsx（記事詳細・single.php相当）
- [ ] pages/category/[slug].tsx（カテゴリーアーカイブ）
- [ ] pages/search.tsx
- [x] pages/404.tsx
- [ ] pages/api/vod.ts（VOD在庫API SSR）
- [ ] pages/api/revalidate.ts

### 6.4 インフラ・デプロイ

- [ ] Cloudflare KV Namespace作成（`VOD_CACHE`）
- [ ] wrangler.jsonc にKVバインディング追加
- [ ] GitHub Secrets登録（CF_API_TOKEN・WP_API_URL）
- [ ] .github/workflows/deploy.yml 作成
- [ ] Cloudflare Cache Rules設定（admin.katsumascore.blog バイパス）
- [ ] katsumascore.blog DNSをCloudflare Workersに切り替え

### 6.5 WordPress側の設定

- [ ] CORS許可: `Access-Control-Allow-Origin: https://katsumascore.blog`
- [ ] ACF REST API公開: `add_filter('acf/rest_api/post/get_fields', '__return_true')`
- [ ] Polylang REST API対応確認（`?lang=` パラメーター）

---

*KatsumaScore WordPressテーマ → Next.js 移行実装ガイド v1.1 ｜ katsumascore.blog ｜ 2026年3月30日*
