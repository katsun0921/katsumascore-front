---
version: "1.0"
name: "KatsumaScore"
description: "映画・VODレビューサイト KatsumaScore のデザインシステム仕様"

colors:
  brand:
    primary: "#2563eb"
    secondary: "#1e1b4b"
    accent: "#6d28d9"
    accent-strong: "#ff2dfc"
    primary-dark: "#1e40af"
    accent-yellow: "#eab308"

  ui:
    header: "#1e1b4b"
    navigation: "#1e1b4b"
    footer: "#0e011c"

  background:
    default: "#ffffff"
    muted: "#f3f4f6"
    surface: "#f7f7f7"
    dark: "#0a0618"
    surface-dark: "#1a1030"
    code: "#111827"

  text:
    primary: "#111827"
    secondary: "#6b7280"
    inverse: "#ffffff"
    muted: "#616161"

  border:
    default: "#d1d5db"
    muted: "#e0e0e0"

  score:
    bg: "#14082e"
    accent: "#ff2dfc"
    rank-low: "#64748b"
    rank-mid: "#2563eb"
    rank-high: "#c026d3"

  highlight:
    bg: "#fefce8"
    mark: "#fef08a"

  product:
    vod: "#4caf50"
    commerce: "#ff9800"

  heading:
    gradient-start: "#667eea"
    gradient-end: "#764ba2"
    gold-start: "#ffd700"
    gold-end: "#ffed4e"

  services:
    netflix: "#e50914"
    amazon: "#00a8e1"
    amazon-shopping: "#ff9900"
    hulu: "#1ce783"
    rakuten: "#bf0000"
    unext: "#1a1a1a"
    disney: "#113ccf"
    dmmtv: "#ff4b00"
    abema: "#00bcd4"
    appletv: "#555555"
    youtube: "#ff0000"
    tsutaya: "#003087"
    geo: "#0066cc"
    imdb: "#f5c518"
    rt: "#fa320a"
    filmarks: "#3a7bd5"
    eiga-com: "#e8562a"

  social:
    twitter: "#1da1f2"
    x: "#000000"
    facebook: "#1877f2"
    instagram: "#e1306c"
    line: "#06c755"
    rss: "#ec7c1c"

typography:
  fonts:
    ja:
      body: "Noto Sans JP"
      heading: "Kaisei Tokumin"
      accent-strong: "Rampart One"
      accent-soft: "Yusei Magic"
    en:
      base: "Inter"
  fallbacks:
    sans: ["system-ui", "sans-serif"]
    serif: ["serif"]
  weights:
    regular: 400
    medium: 500
    bold: 700
  sizes:
    title: "clamp(32px, 4vw, 48px)"
    h1: "clamp(24px, 3vw, 32px)"
    h2: "clamp(20px, 2.5vw, 24px)"
    h3: "clamp(18px, 2vw, 20px)"
    body: "clamp(14px, 1.2vw, 16px)"
    ui: "clamp(12px, 1vw, 14px)"
    caption: "clamp(10px, 0.8vw, 12px)"
  scale-hero:
    score-int: "clamp(72px, 8vw, 96px)"
    score-decimal: "calc(clamp(72px, 8vw, 96px) * 0.625)"

spacing:
  "0": "0px"
  "4": "4px"
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "32": "32px"
  "40": "40px"
  "48": "48px"

border-radius:
  none: "0px"
  sm: "2px"
  default: "4px"
  md: "6px"
  lg: "8px"
  xl: "20px"
  full: "9999px"

breakpoints:
  lg: "768px"

components:
  PostCard:
    description: "記事カード。情報表示のみを担う最小UIコンポーネント"
    layer: "ui-parts"
    props:
      id: "number"
      title: "string"
      excerpt: "string"
      thumbnail: "string"
      score: "number | undefined"
      category: "string | undefined"
      href: "string"
    accessibility:
      - "thumbnail には alt テキストを必ず付与する"
      - "href は next/link の Link コンポーネントを使用する"

  Score:
    description: "映画スコアを視覚的に強調表示するコンポーネント"
    layer: "ui-parts"
    props:
      value: "number"
      rank: "number | undefined"
    variants:
      default: "スコア数字のみ表示"
      hero: "ランク画像とスコアを重ねて大きく表示"
    accessibility:
      - "スコアの数値を aria-label で補足する"

  Badge:
    description: "カテゴリ・タグを示すバッジ"
    layer: "ui-parts"
    props:
      label: "string"
      variant: "primary | secondary | muted"

  Heading:
    description: "ページ・セクションの見出し"
    layer: "ui-parts"
    props:
      level: "1 | 2 | 3 | 4"
      children: "ReactNode"

  CTAButton:
    description: "行動を促すボタン。primary カラーを使用する"
    layer: "ui-parts"
    props:
      href: "string | undefined"
      onClick: "() => void | undefined"
      size: "sm | md"
      children: "ReactNode"
    accessibility:
      - "テキストは i18n.ts 経由で供給する"
      - "disabled 時は aria-disabled を設定する"

  PostList:
    description: "記事カードの配置エンジン。レイアウト専用コンポーネント"
    layer: "ui-section"
    props:
      posts: "PostCardData[]"
      columns: "1 | 2 | 3"

  PostSection:
    description: "意味と余白を持つ記事まとまり。見出しとリストを組み合わせる"
    layer: "ui-section"
    props:
      title: "string"
      posts: "PostCardData[]"

  VodItem:
    description: "VOD サービスの配信情報を表示するコンポーネント"
    layer: "features/vod"
    props:
      service: "string"
      url: "string"
      available: "boolean"

  Pagination:
    description: "ページネーションコントロール"
    layer: "features/pagination"
    props:
      currentPage: "number"
      totalPages: "number"
      basePath: "string"
---

# KatsumaScore デザインシステム

映画・VODレビューサイト **KatsumaScore** のフロントエンドデザインシステム仕様書。  
AIエージェントおよびチームメンバーがUIを一貫して実装・維持するための規約を定義する。

---

## カラー設計

### 基本方針

カラーは**役割（Semantic）**で管理する。HEX 値を直書きせず、必ず CSS 変数（Design Token）を経由する。

```css
/* ✅ 正しい */
color: var(--color-text-primary);
background: var(--color-bg);

/* ❌ 禁止 */
color: #111827;
background: #ffffff;
```

### ブランドカラー

| Token | 値 | 用途 |
|---|---|---|
| `--color-primary` | `#2563eb` | CTA / リンク / アクティブ状態 |
| `--color-secondary` | `#1e1b4b` | Header / Footer / 背景アクセント |
| `--color-accent` | `#6d28d9` | 補助UI（多用しない） |
| `--color-accent-strong` | `#ff2dfc` | Score 枠線・特別強調 |

**primary（#2563eb）**は「信頼・知性・操作」を意味する。ユーザーの行動を促す要素に集中して使用する。  
**secondary（#1e1b4b）**は「深み・映画レビューの重厚感」を表す。サイトの骨格（Header / Footer）に使用する。

### Score カラー（最重要）

Score コンポーネントはサイトで最も目立つ要素であり、専用トークンで厳格に管理する。

| Token | 値 | 用途 |
|---|---|---|
| `--color-score-bg` | `#14082e` | スコア表示背景 |
| `--color-score-accent` | `#ff2dfc` | スコア枠線・強調 |
| `--color-score-rank-low` | `#64748b` | 低ランク色 |
| `--color-score-rank-mid` | `#2563eb` | 中ランク色 |
| `--color-score-rank-high` | `#c026d3` | 高ランク色 |

### アクセシビリティ

- `--color-text-primary`（`#111827`）と `--color-bg`（`#ffffff`）の組み合わせは WCAG AA 対比率を満たす
- テキストに `--color-text-secondary`（`#6b7280`）を使う場合、背景が白 (`#ffffff`) のとき対比率は約 4.6:1（AA 適合）
- Score 表示は装飾的数値だが、`aria-label` で補足することを推奨する

---

## タイポグラフィ設計

### 基本方針

Typography は**役割**と**言語**で管理する。コンポーネント内に `font-family` を直書きしない。

### 日本語フォント

| Token | フォント | 役割 |
|---|---|---|
| `--font-body` | `Noto Sans JP` | 本文・通常説明文 |
| `--font-heading` | `Kaisei Tokumin` | h1 / h2 見出し |
| `--font-accent-strong` | `Rampart One` | ランキング・スコア・特集（限定） |
| `--font-accent-soft` | `Yusei Magic` | タグ・補助ラベル・軽いCTA（限定） |

- **Noto Sans JP**：情報を正しく読ませるための標準フォント
- **Kaisei Tokumin**：見出しに信頼と作品性を与える
- **Rampart One**：強いインパクトで視線を止める（使用率を制限する）
- **Yusei Magic**：親しみと軽やかさで読者に寄り添う（使用率を制限する）

### 英語フォント

| Token | フォント | 役割 |
|---|---|---|
| `--font-ui` | `Inter` | ボタン・ナビゲーション・英語UI全般 |

英語UIには serif を混在させない。英語の演出的フォントは使用しない。

### フォントサイズ

全サイズは `clamp()` によるレスポンシブスケールを採用する。SP・PC 固有の値は書かない。

| Token | 値 | 用途 |
|---|---|---|
| `--font-size-title` | `clamp(32px, 4vw, 48px)` | ページタイトル |
| `--font-size-h1` | `clamp(24px, 3vw, 32px)` | h1 |
| `--font-size-h2` | `clamp(20px, 2.5vw, 24px)` | h2 |
| `--font-size-h3` | `clamp(18px, 2vw, 20px)` | h3 |
| `--font-size-body` | `clamp(14px, 1.2vw, 16px)` | 本文 |
| `--font-size-ui` | `clamp(12px, 1vw, 14px)` | UI要素 |
| `--font-size-caption` | `clamp(10px, 0.8vw, 12px)` | キャプション |

Tailwind ではこれらを `text-h1` / `text-body` / `text-ui` 等の通常クラスで参照する。

---

## スペーシング設計

### 基本方針

スペーシングは Design Token に定義された値のみ使用する。`p-[14px]` などの arbitrary value は禁止。

| Token | 値 | Tailwind スケール |
|---|---|---|
| `--space-0` | `0px` | `0` |
| `--space-4` | `4px` | `1` |
| `--space-8` | `8px` | `2` |
| `--space-12` | `12px` | `3` |
| `--space-16` | `16px` | `4` |
| `--space-20` | `20px` | `5` |
| `--space-24` | `24px` | `6` |
| `--space-32` | `32px` | `8` |
| `--space-40` | `40px` | `10` |
| `--space-48` | `48px` | `12` |

デザイン指定の値が Token に存在しない場合は最も近いスケールへ丸める：

- `6px` → `p-1`（4px）、`14px` → `p-3`（12px）、`18px` → `p-4`（16px）
- `28px` → `p-6`（24px）、`36px` → `p-8`（32px）

---

## コンポーネントレイヤー設計

### レイヤー構成

```
components/
├── ui-parts/     ← 純粋UI（最小単位。hooks/state 禁止）
├── ui-layout/    ← 構造（配置・骨格。ロジック禁止）
├── ui-section/   ← 意味を持つUIまとまり（hooks 禁止）
├── ui-home/      ← Home ページ専用（HomeTemplate からのみ参照）
├── features/     ← ロジック（hooks/state 使用可）
└── templates/    ← 画面構造（PageLayout でラップ必須）
```

### 配置判断フロー

1. **hooks / state を持つか？** → YES: `features/`
2. **意味を持つUIのまとまりか？** → YES: `ui-section/`
3. **レイアウト（配置・骨格）か？** → YES: `ui-layout/`
4. それ以外 → `ui-parts/`

### 1ディレクトリ1コンポーネントルール

1つのディレクトリに置くコンポーネントは1つのみ。子コンポーネントは適切なレイヤーに移動する。

---

## スタイリング設計

### Tailwind と SCSS の使い分け

| レイヤー | 技術 |
|---|---|
| `ui-parts` | Tailwind 必須。SCSS は装飾用途のみ最小限許可 |
| `ui-layout` | Tailwind |
| `ui-section` | SCSS（コンポーネントスコープ） |
| `ui-home` | SCSS（コンポーネントスコープ） |
| `features` | SCSS のみ（Tailwind の余白・レイアウトクラス禁止） |
| `templates` | Tailwind |

### Tailwind クラス命名

テキスト色・背景・枠線はトークン名が二重にならないよう命名する：

```tsx
{/* ✅ 正しい */}
<p className="text-color-primary bg-color-bg border-color-border-muted">

{/* ❌ 禁止（語が二重になる） */}
<p className="text-text-primary bg-bg border-border-muted">
```

### SP ファーストDOM原則

HTMLのDOM順はSP表示順に合わせる。PCレイアウトへの変更はCSSのみで行う。

```tsx
{/* ✅ 正しい — DOM順はSP基準、PCはCSSで再配置 */}
<div className="homeTemplate__body">
  <section>メインA</section>
  <section className="--sidebar">サイドバー</section>
  <section>メインB</section>
</div>

{/* ❌ 禁止 — PCとSPで別DOMを用意する二重管理 */}
<div className="hidden lg:block"><Sidebar /></div>
<div className="lg:hidden"><Sidebar /></div>
```

---

## データフロー

```
WordPress API
  ↓
lib/api（レスポンス取得）
  ↓
features（正規化・transform）
  ↓
components（正規化データのみ受け取る）
  ↓
pages
```

- WordPress生データをコンポーネントに渡すことは禁止
- `post.title.rendered` を直接使用しない → `normalizedPost.title` を使う
- null / 欠損データを前提に設計する

---

## i18n 設計

各コンポーネントに `i18n.ts` を配置し、文字列の直書きを禁止する。

```ts
// components/Header/i18n.ts
export const messages = {
  logo: { alt: { ja: 'KatsumaScore', en: 'KatsumaScore' } },
  cta: { watch: { ja: '動画配信を探す', en: 'Find Streaming' } },
} as const
```

```tsx
// 使用例
const locale = useLocale()
const label = t(messages, ['cta', 'watch'], locale)
```

---

## 禁止事項サマリー

| 禁止 | 代替 |
|---|---|
| HEX 値の直書き | CSS 変数（Design Token） |
| `bg-blue-500` 等のデフォルトカラー | `bg-[var(--color-primary)]` または `bg-primary` |
| `<a href="...">` によるページ遷移 | `<Link>` from `next/link` |
| `<img>` タグ | `<Image>` from `next/image` |
| `any` 型 | 明示的な型定義 |
| `function` キーワード | Arrow 関数のみ |
| arbitrary spacing（`p-[14px]`） | Design Token スケール（`p-3`） |
| ブレークポイント値の直書き | Tailwind プレフィックス（`lg:`） |
| コンポーネント内での fetch | `lib/api` → `features` 経由 |
| ネストした三項演算子 / `switch` 文 | 単純な三項演算子 または 1回の `if/else` |
