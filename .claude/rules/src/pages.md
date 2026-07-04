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
| `movie/[slug].tsx` / `anime/[slug].tsx` / `drama/[slug].tsx` | 記事詳細 | single.php |
| `movie/index.tsx` / `anime/index.tsx` / `drama/index.tsx` | 記事種別アーカイブ | archive.php |
| `server-sitemap.xml.tsx` | WPデータ入り sitemap（SSR） | - |
| `api/vod.ts` | VOD在庫API（SSR） | - |
| `api/revalidate.ts` | ISR再検証 | - |

## データ取得

- `getServerSideProps` でWP REST APIから取得
- ベースURL: `process.env.WP_API_URL`
- 全リクエストに `_embed&acf_format=standard` を付与（ACF＋アイキャッチ取得）
- 記事の言語は **ACF `lang`（`ja` / `en`）** を正とする。一覧は `normalizePosts` で ACF 由来の言語にフィルタする

## 多言語

- `useRouter().locale` で言語取得（`ja` | `en`）
- 正規URLは `/ja/...` / `/en/...`（接頭辞なしは `/ja/...` へリダイレクトされる）
- 記事URL例: `/ja/movie/{slug}` / `/en/movie/{slug}`

## StorybookコンポーネントのNext.jsページへの配置

Score・VodBadge・PostCard 等のStorybookコンポーネントはそのままimportして配置する。
ページ側でSCSSを書かず、Tailwindでレイアウトのみ制御する。

## sitemap 更新ルール（必須）

**taxonomy・タグ・カスタム投稿タイプ（CPT）等で新しい URL ルートを追加したら、必ず同じコミット内で `server-sitemap.xml.tsx` に URL を追加する。**

| 追加した URL の種類 | sitemap への追加方法 |
|---|---|
| 記事種別（movie / anime / drama 等の CPT・カテゴリ） | `mapWPPostToPost` の `slug`（ロケール込みフルパス）＋ `getPostTypeArchivePath` で一覧ページも追加 |
| taxonomy アーカイブ（genre / tag / franchise 等） | ターム列挙 API（`getGenres` / `getTags` / `getAllFranchiseSlugs` 等）× `getTaxonomyUrl` |
| エンティティページ（person / actor / company 等） | 全件列挙 API × `getEntityUrl` |
| VOD アーカイブ | `VOD_ARCHIVE_PATH_SLUGS` × `getVodArchivePath` |
| 固定ページ | `staticPaths` に追加 |

- URL は `src/libs/route.ts` のヘルパーで組み立てる。**パスのハードコード禁止**（過去に `/posts/{slug}` のハードコードが全記事404の原因になった）
- ja / en 両ロケールの URL を列挙する。ただし記事詳細は ACF `lang` に基づき自言語の URL 1本のみ
- ターム全件を列挙する API が無い場合は先に endpoints へ追加する（company が未対応の前例あり）
- 検証: `curl http://localhost:3000/server-sitemap.xml` で新 URL が含まれ、XML が valid であることを確認する
