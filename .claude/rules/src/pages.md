---
paths:
  - src/pages/**
---

# src/pages/

Next.js 15 Pages Router のページファイルを管理するディレクトリ。

## スタイリングルール

- **Tailwind CSS v4 のみ使用**（SCSS・インラインスタイル禁止）
- `className` 結合は `clsx` を使用: `import clsx from 'clsx'`
- App Router は使用しない。Pages Router を維持する

## ファイル構成

| ファイル | 役割 | 対応WPテンプレート |
|---|---|---|
| `_app.tsx` | フォント・グローバルCSS設定 | - |
| `index.tsx` | 記事一覧（トップ） | index.php / page-home.php |
| `404.tsx` | 404エラーページ | 404.php |
| `search.tsx` | 検索結果 | search.php |
| `featured.tsx` | 特集記事 | page-featured-article.php |
| `seasonal.tsx` | 季節アニメレビュー | page-seasonal-anime-and-dramas-reviews.php |
| `posts/[slug].tsx` | 記事詳細 | single.php |
| `category/[slug].tsx` | カテゴリーアーカイブ | archive.php |
| `api/vod.ts` | VOD在庫API（SSR） | - |
| `api/revalidate.ts` | ISR再検証 | - |

## データ取得

- `getServerSideProps` でWP REST APIから取得
- ベースURL: `process.env.WP_API_URL`
- 全リクエストに `_embed&acf_format=standard` を付与（ACF＋アイキャッチ取得）
- 記事の言語は **ACF `lang`（`ja` / `en`）** を正とする（Polylang は使用しない）
- WP REST には互換のため `?lang=ja` / `?lang=en` を付与する場合があるが、一覧は `normalizePosts` で ACF 由来の言語に必ずフィルタする

## 多言語

- `useRouter().locale` で言語取得（`ja` | `en`）
- デフォルトロケール: `ja`（URLに `/ja/` は付かない）
- 英語URL: `/en/posts/{slug}`

## StorybookコンポーネントのNext.jsページへの配置

Score・VodBadge・PostCard 等のStorybookコンポーネントはそのままimportして配置する。
ページ側でSCSSを書かず、Tailwindでレイアウトのみ制御する。
