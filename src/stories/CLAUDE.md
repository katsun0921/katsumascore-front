# src/stories/

Storybookのストーリーファイルとコンポーネント（TSX）を管理するディレクトリ。
`katsumascore_design_system` の `src/stories/` 構造を踏襲している。

## 基本ルール

- **SCSSのみ使用**（Tailwindクラスは書かない）
- スタイルは `src/scss/object/` 以下のSCSSをimportして適用
- インラインスタイルは使用しない
- ストーリーは必ず **3パターン以上** のバリエーションを用意する

## ディレクトリ構造

```
src/stories/
├── components/     # 汎用UIコンポーネント（Score・VodBadge・Category等）
├── layouts/        # レイアウト系（Header・Footer・Sidebar・Navigation・Sharing）
├── post/           # 投稿関連
└── projects/       # ページ単位の複合コンポーネント（Post・Info・Content・Summary）
```

## ストーリーファイルの規則

- ファイル名: `{ComponentName}.stories.tsx`
- コンポーネント本体: `{ComponentName}.tsx`（同ディレクトリ内）
- SCSSは `src/scss/object/component/_{componentName}.scss` に配置

```
src/stories/components/Score/
├── Score.tsx            # コンポーネント本体
└── Score.stories.tsx    # ストーリー定義
```

## コンポーネントのSCSS importパターン

```tsx
// Score.tsx
import '@/scss/object/component/_score.scss'
import '@/scss/object/utility/index.scss'  // 必要に応じて
```

## Next.jsページへの再利用

Storybookコンポーネントは `src/pages/` からそのままimportして使用できる。
その場合、ページ側のスタイリングはTailwindで行い、コンポーネント自体のSCSSは変更しない。
