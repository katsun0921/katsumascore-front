# KatsumaScore フロントエンド設計・移行ガイド（CLAUDE.md）

> v3.2 ― i18n設計ルール追加
> 2026年4月5日

## ■ 本ドキュメントの位置付け

本ドキュメントは以下を統合した唯一の正規仕様である：

- WordPress → Next.js 移行ガイド
- フロントエンド設計規約
- Storybook設計ルール

---

## ■ 最重要原則（必読）

### 1. Feature First設計

components/
├── features/
│   └── PostCard, PostList, VodPanel, ...
└── features/ArticleBlock/
    └── Summary, GoodPoint, ...

- すべてのドメインロジックはcomponents/featuresに集約する
- components/uiにビジネスロジックを書かない

---

### 2. レイヤー責務

| レイヤー | 役割 |
|----------|------|
| components/features | 機能コンポーネント（PostCard, ArticleBlock等） |
| components/features/ArticleBlock | ACFコンポーネント群 |
| components/ui | 純粋UI（Score, Heading, Badge等） |
| components/layout | 構造（Header, Footer, Sidebar等） |
| pages | 組み立て |

---

### 3. WordPress依存の隔離

❌ 禁止: post.title.rendered  
✅ 必須: normalizedPost.title

---

## ■ UI設計原則（追加）

### 1. コンポーネント責務分離（厳守）

- PostCard：最小UI（データ表示のみ）
- PostVariants：レイアウト差分（ラップのみ）
- PostList：配置（レイアウトエンジン）
- PostSection：意味と余白
- Template：画面構造

❌ 禁止:
- variantによる分岐（variant="grid" など）
- コンポーネント内でのデータ取得
- UIとレイアウト責務の混在

---

### 2. レイアウト設計原則

- 余白は親コンポーネントが管理する
- 子コンポーネントはmarginを持たない
- 高さは「揃える / 崩す」を意図的に設計する
- grid崩れを許容しない

---

### 3. Storybook設計原則

- StorybookはUI確認ツールではなくUI仕様書とする
- 必ず異常系（Chaos）を含める
- 以下を最低限含める:
  - LongTitle
  - NoImage
  - MixedData
  - Dense（10+）
  - Extreme（20+）

---

### 4. データ設計原則

- APIレスポンスは必ずtransformする
- UIは正規化データのみ扱う
- null / 欠損を前提に設計する

---

### 5. 禁止ルール（強化）

- fetchをcomponents内で使用
- WordPressレスポンスを直接使用
- any型の使用
- ハードコードカラー（#xxxxxx）
- Tailwindの色指定（bg-blue-500など）
- `<a href="...">` によるページ遷移 → `<Link>` from `next/link` を使用
- `<img>` タグの使用 → `<Image>` from `next/image` を使用
- `style` propの直接使用 → featuresからのpropsとして受け取る場合のみ許可

---

### 6. Lintによる設計強制

本プロジェクトでは以下を自動検出する:

- variantの不正使用
- コンポーネント内fetch
- Story未作成
- ディレクトリ構造違反

👉 設計は「守るもの」ではなく「破れないもの」とする

---

## ■ ディレクトリ構成（最新版）

```
src/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── templates/
│   │   └── HomeTemplate/
│   │
│   └── features/
│       └── post/
│           ├── PostCard/
│           ├── PostLeftImage/
│           ├── PostTopImage/
│           ├── PostOverlay/
│           ├── PostList/
│           ├── PostSection/
│           ├── PostContent/
│           ├── PostDetail/
│           │
│           ├── types/
│           ├── mocks/
│           ├── hooks/
│           ├── utils/
│           └── index.ts
│
├── lib/
│   └── api/
│       ├── wordpress.ts
│       └── wordpress.schema.ts
│
├── pages/
├── styles/
└── types/
```

---

## ■ スタイリング設計（厳守）

### 原則：Tailwind を優先し、SCSS は限定的に使用する

| 対象 | 技術 |
|------|------|
| pages | Tailwind |
| components/layout | Tailwind |
| components/templates | Tailwind |
| components/features | SCSS（コンポーネントスコープ）※ドメインロジックに依存し複雑になるため許容 |
| components/ui | Tailwind |

### Tailwind使用ルール

- `padding` / `margin` / `text-align` / `display` / `gap` / `flex` / `grid` 等のレイアウト・余白はTailwindで記述する
- カラーは必ずCSS変数経由で指定する（例: `bg-[var(--color-footer)]`）
- Tailwindのデフォルトカラークラス（`bg-blue-500` など）は使用禁止

### SCSSの使用範囲（features のみ）

- `font-family` / `font-size` / `letter-spacing` / `line-height` などタイポグラフィ
- `color`（`rgba` による透明度階層管理）
- `transition` / `transform` などアニメーション
- `:hover` / `:focus` などインタラクション
- `@media` によるレスポンシブ（gapの調整など細粒度のもの）

### @media クエリの管理（重要）

- ブレークポイントの値は `globals.css` の `@theme` で一元管理する
- コンポーネント（TSX / SCSS）に `@media (max-width: 480px)` などの値を直接書かない
- レスポンシブは Tailwind のプレフィックス（`sm:` / `md:` / `lg:`）で表現する

```css
/* globals.css — ブレークポイント定義 */
@theme inline {
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;
  --breakpoint-xl: 1280px;
}
```

```tsx
{/* コンポーネント — Tailwind プレフィックスで使用 */}
<ul className='flex gap-9 sm:gap-6'>
```

### 混在禁止

❌ layout・templates・ui のコンポーネントに `.scss` ファイルを作成しない
❌ features のコンポーネントで Tailwind の余白・レイアウトクラスを使用しない。ビジネスロジックや複雑なレイアウトが多々あるためscssファイルのみで運用をする
❌ コンポーネントの TSX / SCSS に `@media` のブレークポイント値を直書きしない

---

## ■ コンポーネント設計

### PostCard（基準設計）

type PostCardData = {
  id: number
  title: string
  excerpt: string
  thumbnail: string
  score?: number
  category?: string
  href: string
}

---

### ■ Post構造設計（重要）

PostCard → UI最小単位  
PostVariants → レイアウト  
PostList → 配置  
PostSection → 意味  
Template → 画面

👉 variantではなく構造で解決する

---

## ■ データフロー

WordPress API
↓
lib/api
↓
features（正規化）
↓
components
↓
pages

---

## ■ 禁止事項

- WordPress生データの使用
- componentsにロジックを書く
- スタイル責務違反
- PageLayoutに処理を書く

---

## ■ i18n設計

### 原則

- 設計しすぎない。実際の使用頻度から最適化する
- 初期はコンポーネント単位で分散し、問題を観測してから共通化する

### フェーズ構成

| フェーズ | 状態 | 内容 |
|----------|------|------|
| 1（現行） | 運用中 | コンポーネント単位のi18n |
| 2 | 将来 | 頻出語の検知・警告 |
| 3 | 将来 | global i18nへ昇格（Design Token化） |
| 4 | 将来 | `/src/i18n/messages.ts` に統合 |

### フェーズ1ルール（厳守）

- i18nは各コンポーネント内に閉じる
- messagesはコンポーネント配下の `i18n.ts` に定義する
- keyはUI構造ベースで命名する（意味ベース禁止）
- path配列でアクセスする（string直書き禁止）

```ts
// ✅ 正しい
const label = t(['header', 'search'])

// ❌ 禁止
const label = “検索”
```

### ESLintルール

`katsumascore-ui/no-hardcoded-i18n` — 日本語・英語単語のハードコードを検出（現在: `warn`）

- 将来的に `error` へ昇格する
- 例外はコメントで個別に許可する:

```ts
// eslint-disable-next-line katsumascore-ui/no-hardcoded-i18n
const label = “OK”
```

### Storybook検証

- locale切替（ja / en）を必ず実装する
- 翻訳漏れは `console.warn` で検知する

---

## ■ 最終指針

このプロジェクトは「WordPressテーマの移植」ではない。
“再設計されたフロントエンド”である。
