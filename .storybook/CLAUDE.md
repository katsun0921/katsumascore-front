# .storybook/

Storybookの設定ファイルを管理するディレクトリ。

## 作業ルール

- Storybookのスタイル移行・調整を行う前に、必ず `docs/` 配下のスタイルガイドを読み込む
- 現時点では `docs/katsumascore_design_rules.md` を優先して参照する
- `katsumascore_design_system` からの移行作業は `docs/storybook_style_migration.md` の手順に沿って進める
- SCSSは `src/styles` のような専用ディレクトリにまとめず、対応するTSXと同じディレクトリに配置する
- 形式は `Component.tsx` と `Component.scss` を基本とする

## 公開URL

GitHub Pagesで公開しているStorybook:

`https://katsun0921.github.io/katsumascore-front/`

---

## Storybook設計原則

### ■ 位置づけ

StorybookはUI確認ツールではなく**UI仕様書**とする。

### ■ Story作成原則

- 正常系ではなく異常系を重視する
- Chaosデータで検証する
- 以下のStoriesを最低限含める：
  - `LongTitle`
  - `NoImage`
  - `MixedData`
  - `Dense`（10件以上）
  - `Extreme`（20件以上）

### ■ 禁止事項

- variantによる分岐肥大
- コンポーネント内でのデータ取得
- UIとレイアウトの混在
- Story未作成のコンポーネント

---

## コンポーネント構造（確定）

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
│   ├── BasicInfo
│   ├── CreditInfo
│   ├── ShareButtons
│   ├── Carousel
│
├── features/ArticleBlock/
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

## WordPress → Storybook マッピング

### ■ ディレクトリ対応

| WordPress | Storybook |
|---|---|
| template-parts/components | ui / features |
| template-parts/post | features |
| template-parts/plugins/acf | features/ArticleBlock |
| template-parts/plugins/acf/vod | ui/VodItem |

### ■ ACFコンポーネント対応

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

### ■ VOD個別コンポーネント

`vod/` 配下はすべて分解してUI化する。

| WordPress | Storybook |
|---|---|
| netflix.php | VodItem |
| amazon-prime-video.php | VodItem |
| u-next.php | VodItem |
| disney-plus.php | VodItem |

### ■ データ非改変原則

- WordPress DB構造は変更しない
- ACFフィールドは変更しない
- REST APIレスポンスは変更しない

WordPressは「データ定義」、Storybookは「UI定義」として分離する。

---

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

- `globals.css` を読み込んでTailwindとグローバルCSS変数を反映する
- SCSSは各TSXから個別にimportする

## 使用パッケージ（devDependencies）

- `storybook@^9.1.5`
- `@storybook/react-vite@^9.1.5`
- `@storybook/addon-links`
- `@storybook/addon-docs`
- `@whitespace/storybook-addon-html`
