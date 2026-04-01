# src/scss/

Storybookコンポーネント専用のSCSSを管理するディレクトリ。
`katsumascore_design_system` の `src/scss/` 構造を踏襲している。

## 基本ルール

- **Storybookコンポーネントにのみ使用する**（Next.jsページ・レイアウトには使わない）
- 命名規則は **BEM（Block__Element--Modifier）**
- Next.jsページのスタイリングは Tailwind CSS で行う

## ディレクトリ構造

```
src/scss/
├── global/
│   ├── variable/
│   │   ├── _colors.scss      # カラー変数（vite additionalDataで全SCSSに自動注入）
│   │   └── _fontWeight.scss  # フォントウェイト変数（同上）
│   └── mixin/
│       ├── _screens.scss     # レスポンシブブレークポイント
│       └── _animation.scss   # アニメーション
├── foundation/               # リセット・ベーススタイル
├── layout/                   # header・footer・sidebar等のレイアウト
└── object/
    ├── component/            # score・vodbadge・postcard等の固有コンポーネント
    ├── project/              # post・info・content等のページ単位複合
    └── utility/              # margin・padding・display等のユーティリティ
```

## SCSS変数の自動注入

`_colors.scss` と `_fontWeight.scss` は Vite の `additionalData` で**全SCSSファイルに自動注入**される。
各SCSSファイルで個別に `@use` する必要はない。

```ts
// .storybook/main.ts の viteFinal 設定
css: {
  preprocessorOptions: {
    scss: {
      additionalData: `@use "@/scss/global/variable/_colors.scss" as *; @use "@/scss/global/variable/_fontWeight.scss" as *;`,
    },
  },
}
```

## 主要なSCSS変数（_colors.scss）

| 変数名 | 値 | 用途 |
|---|---|---|
| `$scoreBackground` | `rgb(41 15 72)` | スコアバッジ背景色 |
| `$scoreBackgroundBorder` | `rgb(200 5 229)` | スコアバッジボーダー色 |
| `$color-netflix` | `#E50914` | Netflixブランドカラー |
| `$color-amazon` | `#00A8E1` | Amazon Primeブランドカラー |
| `$color-unext` | `#000000` | U-NEXTブランドカラー |
