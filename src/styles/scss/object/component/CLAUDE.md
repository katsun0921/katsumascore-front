# src/scss/object/component/

Storybookコンポーネントの固有スタイルを管理するディレクトリ。
`katsumascore_design_system` の `src/scss/object/component/` に対応する。

## ファイル命名規則

`_{ComponentName}.scss` の形式でコンポーネントごとに1ファイル。

| ファイル | 対応コンポーネント | BEMブロック |
|---|---|---|
| `_score.scss` | Score | `.c-score` |
| `_vodbadge.scss` | VodBadge | `.vod-badge` |
| `_postcard.scss` | PostCard | `.post-card` |
| `_category.scss` | Category | `.c-category` |
| `_tag.scss` | Tag | `.c-tag` |
| `_button.scss` | Button | `.c-button` |

## SCSSの記述ルール

- BEM命名: `.c-{block}__element--modifier`
- カラー変数（`$scoreBackground`等）は `@use` 不要（vite additionalDataで自動注入済み）
- Tailwindクラスは書かない
- `@use` で外部ファイルを参照する場合は `@/scss/global/` 以下のmixin等のみ

## コンポーネントへのimport

各SCSSファイルはStorybookコンポーネントのTSXから直接importする。

```tsx
// src/stories/components/Score/Score.tsx
import '@/scss/object/component/_score.scss'
```
