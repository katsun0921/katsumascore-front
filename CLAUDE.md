# KatsumaScore フロントエンド設計・移行ガイド（CLAUDE.md）

> v4.1 ― ui → ui-parts に統一
> 2026年4月19日

## ■ 本ドキュメントの位置付け

本ドキュメントは以下を統合した唯一の正規仕様である：

- WordPress → Next.js移行ガイド
- フロントエンド設計規約
- Storybook設計ルール

---

## ■ 最重要原則（必読）

### 1. レイヤー構成

```
components/
├── ui-parts/        ← 純粋UI（最小単位）
├── ui-layout/       ← 構造（配置・骨格）
├── ui-section/      ← 意味を持つUIまとまり
├── ui-home/         ← Home ページ専用の意味あるUI
├── features/        ← ロジック（hooks / state / ドメイン知識）
├── templates/       ← 画面構造
├── docs/            ← Storybook専用ドキュメント
└── typography/      ← タイポグラフィ仕様
```

---

### 2. レイヤー責務

| レイヤー | 役割 | ルール |
|----------|------|--------|
| components/ui-parts | 純粋UI（Score, Heading, Badge等） | propsの値を表示するのみ。hooks/state禁止。i18nのみ許可 |
| components/ui-layout | 構造（Header, Footer, Sidebar等） | ロジック禁止。データ依存禁止。childrenで構成 |
| components/ui-section | 意味を持つUIまとまり（PostList, PostSection等） | ロジック禁止。データはpropsで受け取る。hooks禁止 |
| components/ui-home | Home ページ専用の意味あるUI（HomeCard, HomeCardScrollList等） | ロジック禁止。HomeTemplateからのみ参照される。hooks禁止 |
| components/features | 機能コンポーネント（PostCard, Search, VodItem等） | hooks/state使用可。ui-parts/ui-sectionを組み合わせる |
| components/templates | 画面構造（HomeTemplate, PostDetail等） | ページ単位の組み立て |
| components/docs | Storybook専用（DesignRules等） | 設計・デザインルールの可視化 |
| components/typography | タイポグラフィ仕様 | フォント・サイズトークンの可視化 |
| pages | ルーティング・組み立て | |

### 判断基準（コンポーネント配置のフローチャート）

1. **Q1：ロジック（hooks / state）を持つか？** → YES：features / NO：次へ
2. **Q2：意味を持つUIのまとまりか？** → YES：ui-section / NO：次へ
3. **Q3：レイアウト（配置・骨格）か？** → YES：ui-layout / NO：ui-parts

---

### 3. WordPress依存の隔離

❌ 禁止: post.title.rendered  
✅ 必須: normalizedPost.title

---

## ■ UI設計原則（追加）

### 1. コンポーネント責務分離（厳守）

- PostCard：最小UI（データ表示のみ） → features/Post/
- PostVariants：レイアウト差分（ラップのみ） → features/Post/
- PostList：配置（レイアウトエンジン） → ui-section/
- PostSection：意味と余白 → ui-section/
- Template：画面構造 → templates/

✅ 必須:
- すべてのTemplateは`PageLayout`でラップする（Header/Footerを含むため）

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

#### SPファーストDOM（厳守）

**HTMLのDOM順はSP表示順に合わせる。PCレイアウトへの変更はCSSのみで行う。**

- DOMの並び順 = SPで画面に表示される順序
- PCで位置が変わる要素（サイドバー等）は `grid-column` / `grid-row` / `order` で再配置する
- `display: none` で要素を切り替えるDOMの二重管理は禁止

```tsx
{/* ✅ 正しい — DOM順はSP基準、PCはCSSで右列へ移動 */}
<div className='homeTemplate__body'>        {/* lg: grid 2カラム */}
  <section>メインA</section>               {/* lg: grid-column: 1 */}
  <section className='--sidebar'>サイド1</section>  {/* lg: grid-column: 2 */}
  <section>メインB</section>               {/* lg: grid-column: 1 */}
  <section className='--sidebar'>サイド2</section>  {/* lg: grid-column: 2 */}
</div>

{/* ❌ 禁止 — PCとSPで別DOMを用意する二重管理 */}
<div className='hidden lg:block'><Sidebar /></div>
<div className='lg:hidden'><Sidebar /></div>
```

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
- `function` キーワードによる関数宣言 → Arrow関数のみ使用する（`.tsx` / `.ts` すべてに適用）

---

### 7. ディレクトリ単一コンポーネントルール（厳守）

**1ディレクトリに配置するコンポーネントは1つのみ。**

あるコンポーネントの子コンポーネントは、同じディレクトリに置かず適切なレイヤーに移動する。
このルールは ui-parts / ui-layout / ui-section / features / templates すべてのレイヤーに適用する。

```
❌ 禁止
components/ui-layout/Sidebar/
├── Sidebar.tsx
├── Profile/        ← 子コンポーネントを同階層に置くのは禁止
└── WorkInfo/

✅ 正しい
components/ui-layout/Sidebar/
└── Sidebar.tsx     ← Sidebar のみ

components/features/Sidebar/
├── Profile/
└── WorkInfo/
```

- ロジック（hooks/state）を持つ子コンポーネント → `features/`
- 意味を持つUIまとまり → `ui-section/`
- 汎用的でドメイン非依存な子コンポーネント → `ui-parts/`

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
│   ├── ui-parts/              ← 純粋UI（props表示のみ）
│   │   ├── Badge/
│   │   ├── Breadcrumb/
│   │   ├── CTAButton/
│   │   ├── Category/
│   │   ├── Heading/
│   │   ├── PostCard/           ← Container / Media / Body / Skeleton 等の基礎部品
│   │   ├── Score/
│   │   ├── ScoreHexBadge/
│   │   ├── SearchResultItem/
│   │   ├── ShareButtons/
│   │   ├── Tag/
│   │   ├── VideoEmbed/
│   │   ├── VodDots/
│   │   ├── VodLink/
│   │   └── VodMenuItem/
│   │
│   ├── ui-layout/             ← 構造（配置・骨格）
│   │   ├── Container/
│   │   ├── Footer/
│   │   ├── Grid/
│   │   ├── Header/
│   │   └── Sidebar/
│   │
│   ├── ui-section/            ← 意味を持つUIまとまり
│   │   ├── PostCard/           ← PostCardImgTop / ImgLeft / ImgOverlay
│   │   ├── PostList/
│   │   ├── PostListRow/
│   │   ├── PostSection/
│   │   └── ProductBlock/      ← WordPress ACF ブロック（Gutenberg挿入用）表示確認専用TSX
│   │
│   ├── ui-home/               ← Home ページ専用の意味あるUI（HomeTemplateからのみ参照）
│   │   ├── HomeCard/
│   │   └── HomeCardScrollList/
│   │
│   ├── templates/
│   │   ├── HomeTemplate/
│   │   ├── ListTemplate/
│   │   ├── NotFoundTemplate/
│   │   ├── PageLayout/
│   │   └── PostDetail/
│   │
│   ├── features/
│   │   ├── navigation/        ← ナビゲーション系
│   │   │   ├── HeaderNav/
│   │   │   └── HamburgerMenu/
│   │   ├── search/            ← 検索系
│   │   │   ├── Search/
│   │   │   └── SearchModal/
│   │   ├── vod/               ← VOD系
│   │   │   ├── VodItem/
│   │   │   ├── VodMenu/
│   │   │   └── VodBadge/
│   │   ├── pagination/        ← ページネーション
│   │   │   └── Pagination/
│   │   ├── Post/              ← 記事系
│   │   │   ├── PostCard/
│   │   │   ├── PostContent/
│   │   │   ├── PostDate/
│   │   │   ├── types/
│   │   │   ├── mocks/
│   │   │   └── index.ts
│   │   └── ...
│   │
│   ├── docs/                  ← Storybook専用ドキュメント
│   │   └── DesignRules/
│   │
│   └── typography/            ← タイポグラフィ仕様
│       └── Typography/
│
├── lib/
│   └── api/
│       ├── wordpress.ts
│       └── wordpress.schema.ts
│
├── pages/
├── styles/
├── types/
└── ui-proposals/          ← UIプロトタイプ・提案HTML（実装前の確認用）
```

---

## ■ スタイリング設計（厳守）

### 原則：Tailwind を優先し、SCSS は限定的に使用する

| 対象 | 技術 |
|------|------|
| pages | Tailwind |
| components/ui-parts | Tailwind 必須。SCSSは最小限のみ許可（装飾用途） |
| components/ui-layout | Tailwind |
| components/ui-section | SCSS（コンポーネントスコープ）※レイアウト系の複雑さを許容 |
| components/ui-home | SCSS（コンポーネントスコープ）※ページ固有のスタイル複雑さを許容 |
| components/templates | Tailwind |
| components/features | SCSS（コンポーネントスコープ）※ドメインロジックに依存し複雑になるため許容 |

### Tailwind使用ルール

- `padding` / `margin` / `text-align` / `display` / `gap` / `flex` / `grid` 等のレイアウト・余白はTailwindで記述する
- TailwindのspacingはDesign Tokenに定義された値のみ使用する
- 使用可能なspacingは `0 / 1 / 2 / 3 / 4 / 5 / 6 / 8 / 10 / 12` のみとする
- デザイン指定の値がTokenに存在しない場合は、最も近いspacing tokenへ丸めて実装する
- 例: `14px` は `p-3`、`18px` は `p-4`、`28px` は `p-6`、`36px` は `p-8` を使う
- `p-[14px]` / `gap-[18px]` のような arbitrary value は使用禁止
- カラーは必ずCSS変数経由で指定する（例: `bg-[var(--color-footer)]`）
- Tailwindのデフォルトカラークラス（`bg-blue-500` など）は使用禁止
- CSS変数の色値はHEXで定義する（例: `#2563eb`）。透明度が必要な場合のみ `rgba()` を許可する

### SCSSの使用範囲（features のみ）

- `font-family` / `font-size` / `letter-spacing` / `line-height` などタイポグラフィ
- `color`（値はHEX。透明度が必要な場合のみ `rgba(var(--color-xxx-rgb), 0.x)` を使用）
- `transition` / `transform` などアニメーション
- `:hover` / `:focus` などインタラクション
- `@media` によるレスポンシブ（gapの調整など細粒度のもの）

### @media クエリの管理（重要）

- ブレークポイントの値は `globals.css` の `@theme` で一元管理する
- コンポーネント（TSX / SCSS）に `@media (max-width: 480px)` や `@media (min-width: 1024px)` などの値を直接書かない
- レスポンシブはTailwindのプレフィックス（`sm:` / `md:` / `lg:`）で表現する
- SPファーストを原則とし、Media Queryは `min-width` を使用する

```css
/* globals.css — ブレークポイント定義 */
@theme inline {
  --breakpoint-lg: 768px;
}
```

```tsx
{/* コンポーネント — Tailwind プレフィックスで使用 */}
<ul className='flex gap-3 sm:gap-4 lg:gap-6'>
```

### 混在禁止

❌ ui-layout・templatesのコンポーネントに`.scss`ファイルを作成しない
❌ featuresのコンポーネントでTailwindの余白・レイアウトクラスを使用しない。ビジネスロジックや複雑なレイアウトが多々あるためscssファイルのみで運用をする
❌ コンポーネントのTSX / SCSSに`@media`のブレークポイント値を直書きしない
❌ TailwindのspacingにDesign Token外の値を使わない
❌ Tokenにない値を arbitrary value で逃がさない
❌ `globals.css`にクラスセレクター（`.foo { }`）を書かない → コンポーネントのSCSSに書く

### Typography同期ルール（必須）

`globals.css`の以下のトークンを追加・削除・変更したら、`src/components/typography/Typography/Typography.tsx`の対応するデータ配列を必ず同期する。

| 変更したトークン | 更新する配列 |
|---|---|
| `--color-*` | `brandColors` / `surfaceColors` / `textAndFeatureColors` / `serviceColors` |
| `--font-*` | `fontEntries` |
| `--font-size-*` | `fontSizeEntries` |

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

PostCard → UI最小単位（features/Post/）  
PostVariants → レイアウト差分（features/Post/）  
PostList → 配置（ui-section/）  
PostSection → 意味（ui-section/）  
Template → 画面（templates/）

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
const label = t(messages, ['header', 'search'], locale)

// ❌ 禁止
const label = “検索”
```

### 実装構成（確定）

```
src/i18n/
├── t.ts          — t(messages, path[], locale) 関数。missing時にconsole.warn
└── provider.tsx  — I18nProvider + useLocale() hook

components/Header/
└── i18n.ts       — コンポーネントローカルのメッセージ定義
```

### i18n.ts の書き方

```ts
export const messages = {
  logo: {
    alt: { ja: 'KatsumaScore', en: 'KatsumaScore' },
  },
  cta: {
    watch: { ja: '動画配信を探す', en: 'Find Streaming' },
  },
} as const
```

- `as const` 必須
- keyはUI構造ベース（`logo.alt`、`cta.watch` など）
- ja / enの両キー必須

### コンポーネントでの使い方

```tsx
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'

const locale = useLocale()
const label = t(messages, ['cta', 'watch'], locale)
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

- `I18nProvider` は `.storybook/preview.ts` のdecoratorで全Storyに適用済み
- toolbar（globeアイコン）でja / enをリアルタイム切替可能
- 翻訳漏れは `console.warn` で検知する
- locale固定のStoryは `globals: { locale: 'en' }` で指定する

```ts
export const English: Story = {
  globals: { locale: 'en' },
}
```

---

## ■ 最終指針

このプロジェクトは「WordPressテーマの移植」ではない。
“再設計されたフロントエンド”である。
