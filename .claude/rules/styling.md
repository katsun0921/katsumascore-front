---
paths:
  - src/**
---

# スタイリング設計

## 原則：Tailwind を優先し、SCSS は限定的に使用する（IMPORTANT）

| 対象 | 技術 |
|------|------|
| pages | Tailwind |
| components/ui-parts | Tailwind 必須。SCSSは最小限のみ許可（装飾用途） |
| components/ui-layout | Tailwind |
| components/ui-section | SCSS（コンポーネントスコープ）※レイアウト系の複雑さを許容 |
| components/ui-home | SCSS（コンポーネントスコープ）※ページ固有のスタイル複雑さを許容 |
| components/templates | Tailwind |
| components/features | SCSS（コンポーネントスコープ）※ドメインロジックに依存し複雑になるため許容 |

## Tailwind使用ルール

- `padding` / `margin` / `text-align` / `display` / `gap` / `flex` / `grid` 等のレイアウト・余白はTailwindで記述する
- 使用可能なspacing: `0 / 1 / 2 / 3 / 4 / 5 / 6 / 8 / 10 / 12` のみ
- デザイン指定の値がTokenに存在しない場合は最も近いspacing tokenへ丸める
  - 例: `14px` → `p-3`、`18px` → `p-4`、`28px` → `p-6`、`36px` → `p-8`
- `p-[14px]` / `gap-[18px]` のような arbitrary value は使用禁止
- カラーは必ずCSS変数経由: `bg-[var(--color-footer)]`
- Tailwindのデフォルトカラークラス（`bg-blue-500` 等）は使用禁止
- CSS変数の色値はHEXで定義。透明度が必要な場合のみ `rgba()` を許可

## SCSSの使用範囲（features・ui-section のみ）

- タイポグラフィ: `font-family` / `font-size` / `letter-spacing` / `line-height`
- `color`（値はHEX。透明度が必要な場合のみ `rgba(var(--color-xxx-rgb), 0.x)` を使用）
- `transition` / `transform` などアニメーション
- `:hover` / `:focus` などインタラクション
- `@media` によるレスポンシブ（gapの調整など細粒度のもの）

## @media クエリの管理（重要）

- ブレークポイント値は `globals.css` の `@theme` で一元管理する
- TSX / SCSS に `@media (max-width: 480px)` や `@media (min-width: 1024px)` の値を直接書かない
- レスポンシブは Tailwind プレフィックス（`sm:` / `md:` / `lg:`）で表現する
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

## 混在禁止

❌ ui-layout・templatesのコンポーネントに `.scss` ファイルを作成しない  
❌ featuresのコンポーネントでTailwindの余白・レイアウトクラスを使用しない  
❌ コンポーネントのTSX / SCSSに `@media` のブレークポイント値を直書きしない  
❌ TailwindのspacingにDesign Token外の値を使わない  
❌ Tokenにない値を arbitrary value で逃がさない  
❌ `globals.css` にクラスセレクター（`.foo { }`）を書かない → コンポーネントのSCSSに書く

## Typography同期ルール（必須）

`globals.css` のトークンを追加・削除・変更したら、`src/components/typography/Typography/Typography.tsx` の対応するデータ配列を必ず同期する：

| 変更したトークン | 更新する配列 |
|---|---|
| `--color-*` | `brandColors` / `surfaceColors` / `textAndFeatureColors` / `serviceColors` |
| `--font-*` | `fontEntries` |
| `--font-size-*` | `fontSizeEntries` |

## SPファーストDOM（厳守）

**HTMLのDOM順はSP表示順に合わせる。PCレイアウトへの変更はCSSのみで行う。**

- DOMの並び順 = SPで画面に表示される順序
- PCで位置が変わる要素（サイドバー等）は `grid-column` / `grid-row` / `order` で再配置する
- `display: none` で要素を切り替えるDOMの二重管理は禁止

```tsx
{/* ✅ 正しい — DOM順はSP基準、PCはCSSで右列へ移動 */}
<div className='homeTemplate__body'>        {/* lg: grid 2カラム */}
  <section>メインA</section>               {/* lg: grid-column: 1 */}
  <section className='--sidebar'>サイド1</section>  {/* lg: grid-column: 2 */}
</div>

{/* ❌ 禁止 — PCとSPで別DOMを用意する二重管理 */}
<div className='hidden lg:block'><Sidebar /></div>
<div className='lg:hidden'><Sidebar /></div>
```
