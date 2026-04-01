# .storybook/

Storybookの設定ファイルを管理するディレクトリ。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `main.ts` | stories glob・addons・vite設定・path alias |
| `preview.ts` | グローバルパラメーター設定（背景色等） |

## main.ts の重要設定

### SCSSの自動注入（additionalData）

`_colors.scss` と `_fontWeight.scss` は Vite の `additionalData` で全SCSSに自動注入される。
各SCSSファイルで個別に `@use` する必要はない。

```ts
config.css = {
  preprocessorOptions: {
    scss: {
      additionalData: `@use "@/scss/global/variable/_colors.scss" as *; @use "@/scss/global/variable/_fontWeight.scss" as *;`,
    },
  },
}
```

### Path Alias

```ts
config.resolve.alias = {
  '@': resolve(__dirname, '../src'),
  '@/scss': resolve(__dirname, '../src/scss'),
  '@/assets': resolve(__dirname, '../src/assets'),
}
```

### stories glob

```ts
stories: ['../src/stories/**/*.stories.@(js|jsx|ts|tsx)'],
```

## preview.ts の注意事項

- `globals.css`（Tailwind）は読み込まない
- SCSSはviteのadditionalDataで自動注入済みのため個別importも不要

## 使用パッケージ（devDependencies）

- `storybook@^9.1.5`
- `@storybook/react-vite@^9.1.5`
- `@storybook/addon-links`
- `@storybook/addon-docs`
- `@whitespace/storybook-addon-html`
