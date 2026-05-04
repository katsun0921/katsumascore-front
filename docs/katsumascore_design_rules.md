# KatsumaScore フロントエンド設計規約（統合版）

> KatsumaScore フロントエンド設計仕様  
> 2026年4月（Tailwind / Token 命名ルール追記）

---

# ■ UIアーキテクチャ原則

## ■ コンポーネント責務分離

- PostCard：最小UI（情報表示のみ）
- PostVariants：レイアウト差分（ラップのみ）
- PostList：配置（レイアウトエンジン）
- PostSection：意味と余白
- Template：画面構造

---

## ■ 禁止事項

- variantによる分岐肥大
- コンポーネント内でのデータ取得
- UIとレイアウトの混在

---

## ■ レイアウト原則

- 余白は親が管理する
- 高さは意図的に揃える/崩す
- grid崩れを許容しない

---

## ■ Storybook原則

- 正常系ではなく異常系を重視
- Chaosデータで検証
- UI仕様書として扱う

---

## ■ データ原則

- APIレスポンスは必ず変換する
- UIは整形済みデータのみ扱う
- null / 欠損前提で設計する

---

## ■ 最終原則

UIは「壊れないこと」が最優先である。

---

# ■ Storybook移行設計書（ACF統合版）

## ■ 参照ルート

```
./katsumascore_wordpress_theme/
```

---

## ■ 目的

WordPressテーマのUIを完全に分解し、
ACFコンポーネントを含めてStorybookへ統合する。

---

## ■ 最重要原則：データ非改変

- WordPress DB構造は変更しない
- ACFフィールドは変更しない
- REST APIレスポンスは変更しない

---

## ■ 設計の本質

template-partsはすべて「UIコンポーネント」として扱う。
とくに以下は重要：

- components → ui / features
- plugins/acf → ArticleBlock（最重要）
- post → features

---

## ■ Storybook最終構造（確定）

```
components/
├── ui/
│   ├── Score
│   ├── Heading
│   ├── Date
│   ├── Badge
│   ├── Pagination
│   ├── SocialIcons
│   ├── Breadcrumb
│   ├── SearchBox
│   ├── VideoEmbed
│
├── features/
│   ├── PostCard
│   ├── PostList
│   ├── VodPanel
│   ├── ArticleHeader
│   ├── ArticleMeta
│   ├── TitleMeta
│   ├── CreditInfo
│   ├── ShareButtons
│   ├── Carousel
│
├── features/
│   ├── Summary
│   ├── GoodPoint
│   ├── ReviewSiteScores
│   ├── StreamingVod
│   ├── ActorsInfo
│   ├── ProductBlock
│   ├── AdRental
│   ├── CinemaCheck
│   ├── RelationPost
│   ├── VodItem
│
├── layout/
│   ├── Header
│   ├── Footer
│   ├── Sidebar
│   ├── Container
│   ├── Grid
```

---

## ■ ACFコンポーネント対応

| WordPress（ACF） | Storybook |
|---|---|
| acf-summary.php | ArticleBlock/Summary |
| acf-good-point.php | ArticleBlock/GoodPoint |
| acf-review-site-scores.php | ArticleBlock/ReviewSiteScores |
| acf-streaming-vod.php | ArticleBlock/StreamingVod |
| actors-info.php | ArticleBlock/ActorsInfo |
| product-block.php | ArticleBlock/ProductBlock |
| ad-rental.php | ArticleBlock/AdRental |
| single-cinema-check.php | ArticleBlock/CinemaCheck |
| acf-relation-by-post-id.php | ArticleBlock/RelationPost |

---

## ■ VOD個別コンポーネント

`vod/` 配下はすべて分解してUI化する。

| WordPress | Storybook |
|---|---|
| netflix.php | VodItem |
| amazon-prime-video.php | VodItem |
| u-next.php | VodItem |
| disney-plus.php | VodItem |

---

## ■ マッピングルール（確定）

| WordPress | Storybook |
|---|---|
| template-parts/components | ui / features |
| template-parts/post | features |
| template-parts/plugins/acf | features/ |
| template-parts/plugins/acf/vod | ui/VodItem |

---

## ■ 結論

ACFも含め、WordPressテーマのすべてのUIはStorybookコンポーネントへ完全分解される。

WordPressは「データ定義」、Storybookは「UI定義」として分離される。

---

# ■ カラールール

## ■ 方針

カラーは「役割」で管理する。  
直接値を使用せず、必ずDesign Tokenを経由する。

---

## ■ カラーパレット

### ■ Primary（ブランドの軸）
```
#2563eb
```

- 用途：CTA / リンク / アクティブ状態
- 意味：信頼・知性・操作

---

### ■ Secondary（世界観）
```
#1e1b4b
```

- 用途：Header / Footer / 背景アクセント
- 意味：深み・映画レビューの重厚感

---

### ■ Accent（補助）
```
#6d28d9
```

- 用途：補助UI
- 原則：多用しない

---

### ■ Score（最重要）
```
背景: #14082e
枠線: #ff2dfc
```

- 用途：評価表示
- 原則：最も目立たせる

---

### ■ Background
```
#ffffff
#f3f4f6
```

---

### ■ Text
```
#111827
#6b7280
```

---

## ■ 使用ルール

| 要素 | カラー |
|------|--------|
| CTA / リンク | primary |
| 背景 | bg |
| テキスト | text |
| 評価（Score） | score |
| 補助UI | accent |

実装では、**本文色・補助色など“text トークンを文字色に使う”場合**に `text-text-primary` のように語が重複しないよう、**`text-color-primary` / `text-color-secondary` 等**を用いる（詳細は「Tailwind 実装規約」）。

---

## ■ 禁止事項

- 直接カラーコードを書く
- Tailwindのデフォルトカラーを使用する（例：bg-blue-500）
- 同一画面で複数の強い色を使う

---

## ■ 原則

色は「意味」で使う。  
装飾として使わない。

---

# ■ Typography ルール

## ■ 方針

Typography は「役割」と「言語」で管理する。  
本文、見出し、UI、アクセントを分離し、直接 font-family を散発的に書かない。

---

## ■ 日本語 font-family

- 本文：`Noto Sans JP`
- 見出し：`Kaisei Tokumin`
- アクセント（強）：`Rampart One`
- アクセント（柔）：`Yusei Magic`

### ■ 意味づけ

- `Noto Sans JP` → 情報を正しく読ませる
- `Kaisei Tokumin` → 見出しに信頼と作品性を与える
- `Rampart One` → 強いインパクトで視線を止める
- `Yusei Magic` → 親しみと軽やかさで読者に寄り添う

### ■ 使用ルール

- body / 本文 / 通常説明文は `Noto Sans JP`
- h1 / h2 は `Kaisei Tokumin`
- h3 以降は `Noto Sans JP`
- `Rampart One` はランキング・スコア・特集など限定的に使用
- `Yusei Magic` はタグ・補助ラベル・軽いCTAに限定
- 本文に serif を使わない
- アクセントフォントは常用しない（使用率を制限する）

---

## ■ 英語 font-family

- 本文 / UI：`Inter`

### ■ 意味づけ

- `Inter` → 情報と UI を明快かつ安定して読ませる

### ■ 使用ルール

- 英語本文は `Inter`
- button / nav / meta / tag など英語 UI は常に `Inter`
- 英語 UI に serif を混在させない
- 英語の演出的フォントは使用しない（日本語設計との一貫性を優先）

---

## ■ Weight ルール

### ■ Sans

- 400：本文
- 500：UI
- 700：強調

### ■ Serif

- 600〜700：見出し

---

## ■ 実装ルール

- `:root` の `--font-*` token で定義する
- `:lang(ja)` と `:lang(en)` で言語を分離する
- 日本語と英語の font-family を暗黙に混在させない
- fallback は必ず `system-ui`, `sans-serif`, `serif` を含める
- 英語 UI 用フォントは `@theme` の **`font-ui`**（`--font-ui`）を Tailwind クラス **`font-ui`** で指定する
- フォント**サイズ**は `@theme` の **`text-ui` / `text-body` / `text-h3` 等**（`--text-*` → `--font-size-*`）を使い、**廃止した `--font-size-ui-lg` は使わず `text-ui` に統一**する
- `globals.css` の `--font-size-*` / `--color-*` を追加・変更したら、**`src/components/typography/Typography/Typography.tsx` の表示用データを同期**する（プロジェクトルール）

---

# ■ Tailwind × Design Token 責務

## ■ 方針

TailwindとDesign Tokenは責務を明確に分離する。

---

## ■ Tailwindの責務

- layout（flex / grid）
- spacing（margin / padding）
- size（width / height）
- border-radius

### ■ Tailwind spacing ルール

- TailwindのspacingはDesign Tokenに定義された値のみ使用する
- 使用可能な値は `0 / 1 / 2 / 3 / 4 / 5 / 6 / 8 / 10 / 12`
- 対象は `p-*` / `px-*` / `py-*` / `pt-*` / `pb-*` / `pl-*` / `pr-*` / `m-*` / `gap-*` 系すべて
- デザイン指定の値がTokenに存在しない場合は、最も近いtokenへ寄せて実装する
- 例: `6px` は `2`、`14px` は `3`、`18px` は `4`、`28px` は `6`、`36px` は `8`
- `p-[14px]` や `gap-[18px]` のような arbitrary value は禁止

---

## ■ Design Tokenの責務

- color
- typography
- shadow

---

## ■ 統合ルール

すべての視覚表現はToken経由でTailwindに流す。

- spacingも例外ではなく、必ずDesign Tokenに揃える
- Tokenにないspacing値は「近い値へ丸める」が原則であり、新しい中間値をその場で増やさない
- breakpointは `globals.css` の token を唯一の参照元とする
- Media QueryはSPファーストで `min-width` を使う
- **色・余白・フォントサイズは `src/styles/globals.css` の `@theme inline` に登録したトークンを、Tailwind の通常ユーティリティ（`text-*` / `bg-*` / `p-*` 等）として使う**（下記「実装規約」参照）

---

## ■ Tailwind 実装規約（`@theme` 連携）

### ■ 方針

- Design Token は `:root` の CSS 変数（`--color-*` / `--font-size-*` / `--space-*` 等）を正とする。
- Tailwind v4 では `globals.css` の `@theme inline` に **テーマ用のエイリアス** を置き、`text-*` / `bg-*` / `p-*` などの **通常クラス**で参照する。
- **arbitrary value（`text-[var(--…)]` 等）は、テーマ未登録の例外に限る。** 登録済みトークンは必ずテーマ経由のクラスに寄せる。

### ■ 色（Color）

- テーマ色は `text-primary` / `bg-surface` / `border-color-border-muted` のように **プレフィックス＋トークン名**で付与する。
- **重複を避ける命名**  
  - 本文色・補助色・反転色など *text 系* を表す用途では、`text-text-primary` のように **同じ語が二重**になるのを避け、**`text-color-primary` / `text-color-secondary` / `text-color-muted` / `text-color-inverse`** を使う。  
  - 背景のページ地・地色付き背景は **`bg-color-bg` / `bg-color-bg-muted`**。  
  - 枠線は **`border-color-border` / `border-color-border-muted` / `border-color-border-soft`**。  
- 上記 `text-color-*` / `bg-color-*` / `border-color-*` は `@theme` で `--color-color-*` として **既存の `--color-text-*` / `--color-bg*` / `--color-border*` へエイリアス**している（トークン値の単一正本は従来どおり `:root`）。

### ■ 余白（Spacing）

- `--space-*`（px 名付き）に対応する Tailwind スケール `0 / 1 / 2 / …` へマッピングし、**`p-4` / `gap-3` / `m-6` 等の通常クラス**で指定する。
- **`p-[var(--space-16)]` のような arbitrary spacing は使わない**（トークン値を近いスケールへ寄せ、上記スケールのみ使用）。

### ■ フォントサイズ

- 標準の段階（title / h1–h3 / body / ui / caption）は `@theme` の **`--text-*` → `text-h1` / `text-h3` / `text-body` / `text-ui` / `text-caption` 等**で指定する。
- **`--font-size-ui-lg`（旧 PC 用 UI 大）は廃止**し、**`text-ui`（`--font-size-ui`）に統一**する。可変幅の `clamp` が正本。
- `text-[length:var(--font-size-ui)]` のように **`length:` 型ヒント付き arbitrary** を多用しない。テーマ化済みなら **`text-ui` 等の通常クラス**に置き換える。

### ■ フォントファミリ（UI 用）

- 英語 UI 用の `Inter` 系は `@theme` の **`font-ui`**（`--font-ui`）を使う。  
- **`font-[var(--font-ui)]` は使わない**（`font-*` ユーティリティは font-weight 解釈になり誤るため）。必要なら **`[font-family:var(--font-ui)]`** か **`font-ui`**。

### ■ 使用例（推奨）

```tsx
<div className="p-4 gap-3 rounded-lg bg-color-bg text-color-primary border border-color-border-muted">
  <p className="text-ui text-color-secondary">補足</p>
  <h2 className="text-h3 font-bold text-color-primary">見出し</h2>
</div>
```

---

## ■ 使用例（旧・非推奨パターン）

次のような書き方は、移行候補・禁止に近い扱いとする。

```tsx
{/* arbitrary の乱用（テーマ化できる色・余白・フォントサイズ） */}
<div className="p-[var(--space-16)] text-[var(--color-text-primary)] text-[var(--font-size-ui)]" />
```

---

## ■ 禁止事項

- Tailwindで**HEX や**Tailwind デフォルトパレット（`bg-blue-500` 等）を直接指定する
- **テーマ化可能な**色・余白・フォントサイズに対して `*-[var(--…)]` arbitrary を使い続ける（**登録して通常クラスへ寄せる**）
- `text-text-*` / `bg-bg*` / `border-border*` のように **ユーティリティ名がトークンと二重化**するクラス名（**`text-color-*` / `bg-color-bg*` / `border-color-border*`** に統一する）
- `font-[var(--font-ui)]` の使用（**`font-ui` または ` [font-family:var(--font-ui)]`**）
- 廃止した **`--font-size-ui-lg` / `text-ui-lg` 相当**の参照
- SCSSでspacingを定義する
- TailwindでToken外のspacingを使う
- Tailwind arbitrary spacingで**数字付きpx**を直書きする
- breakpoint値をTSX / SCSSへ直書きする
- `max-width` ベースのMedia Queryを書く
- Tokenを使わずにスタイルを書く

---

# ■ TSX と SCSS の関係

## ■ 方針

SCSS はコンポーネントが所有する。  
共通の `styles/scss` ディレクトリは作らない。

---

## ■ ルール

- `tsx` と `scss` は必ず同じディレクトリに置く
- ファイル名は `Component.tsx` と `Component.scss` を基本とする
- SCSS は対応する TSX から直接 import する
- 1つのコンポーネントの見た目は、そのコンポーネント配下で閉じる
- グローバルに許可されるのは `styles/globals.css` のみ

---

## ■ 例

```bash
src/components/ui/Heading/
├── Heading.tsx
├── Heading.scss
└── Heading.stories.tsx
```

```tsx
import './Heading.scss'
```

---

## ■ 責務分離

### ■ `Component.tsx`

- DOM構造
- props
- state
- className の付与
- `Component.scss` の import

### ■ `Component.scss`

- そのコンポーネント固有の見た目
- BEM / component class の定義
- pseudo element や hover など Tailwind で持たせない視覚表現

### ■ `styles/globals.css`

- reset
- base
- Design Token の CSS 変数
- Tailwind の入口

---

## ■ 禁止事項

- `styles/scss` のような専用SCSSディレクトリを再作成する
- 他コンポーネントの SCSS を前提に見た目を成立させる
- TSX から離れた場所にコンポーネント専用 SCSS を置く
- reset / base 以外の責務を `globals.css` に追加する

---

## ■ 原則

Tailwindは「構造と配置」、
Tokenは「意味と視覚」を定義する。
SCSSは「コンポーネント固有の視覚表現」を定義する。

---

# ■ i18n（テキスト管理）ルール

## ■ 方針

テキストはコンポーネント単位で管理する。
文字列の直書きを禁止し、すべて `i18n.ts` 経由で扱う。

---

## ■ 基盤構成

```
src/i18n/
├── t.ts          — 翻訳関数（path配列アクセス、missing時console.warn）
└── provider.tsx  — I18nProvider / useLocale() hook
```

各コンポーネントに `i18n.ts` を配置する。

```
components/Header/
├── Header.tsx
└── i18n.ts
```

---

## ■ messages定義ルール

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
- keyはUI構造ベースで命名（意味ベース禁止）
- `ja` / `en` 両キー必須

---

## ■ アクセス方法

```tsx
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'

const locale = useLocale()
const label = t(messages, ['cta', 'watch'], locale)
```

---

## ■ 禁止事項

- JSX内への日本語・英語文字列の直書き
- string keyによるアクセス（`messages.cta.watch.ja` など）
- `any` 型の使用

---

## ■ ESLintによる強制

`katsumascore-ui/no-hardcoded-i18n`（現在: warn、将来: error）

---

## ■ Storybookでの検証

- toolbar（globeアイコン）で ja / en をリアルタイム切替
- 翻訳漏れは `console.warn` で検知
- locale固定Storyは `globals: { locale: 'en' }` で指定
