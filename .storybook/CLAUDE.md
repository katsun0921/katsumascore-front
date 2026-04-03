# .storybook/

Storybookの設定ファイルを管理するディレクトリ。

## 作業ルール

- Storybook のスタイル移行・調整を行う前に、必ず `docs/` 配下のスタイルガイドを読み込む
- 現時点では `docs/katsumascore_design_rules.md` を優先して参照する
- `katsumascore_design_system` からの移行作業は `docs/storybook_style_migration.md` の手順に沿って進める
- SCSS は `src/styles` のような専用ディレクトリにまとめず、対応する TSX と同じディレクトリに配置する
- 形式は `Component.tsx` と `Component.scss` を基本とする

## 公開URL

GitHub Pages で公開している Storybook:

`https://katsun0921.github.io/katsumascore-front/`

## ファイル構成

| ファイル | 役割 |
|---|---|
| `main.ts` | stories glob・addons・vite設定・path alias |
| `preview.ts` | グローバルパラメーター設定（背景色等） |

## main.ts の重要設定

### Path Alias

```ts
config.resolve.alias = {
  '@': resolve(__dirname, '../src'),
  '@/assets': resolve(__dirname, '../public'),
}
```

### stories glob

```ts
stories: [
  '../src/components/**/*.stories.@(js|jsx|ts|tsx)',
  '../src/features/**/*.stories.@(js|jsx|ts|tsx)',
],
```

## preview.ts の注意事項

- `globals.css` を読み込んで Tailwind とグローバルCSS変数を反映する
- SCSS は各 TSX から個別に import する

## 使用パッケージ（devDependencies）

- `storybook@^9.1.5`
- `@storybook/react-vite@^9.1.5`
- `@storybook/addon-links`
- `@storybook/addon-docs`
- `@whitespace/storybook-addon-html`
