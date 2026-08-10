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

## 一覧ページのページネーション（必須）

**ページ切り替えはクエリパラメータ `?p=N` を使う。パスセグメント（`/p/N`）で表現しない。**

```
✅ /ja/genre/drama?p=2
❌ /ja/genre/drama/p/2
```

理由: `/p/N` と `?p=N` の両方が 200 を返すと Search Console で別ページとして扱われ、重複コンテンツになる。実際に `genre` / `tag` で発生した。

| 項目 | ルール |
|---|---|
| 1ページ目 | パラメータを付けない（`/ja/genre/drama`） |
| 2ページ目以降 | `?p=N`（`/ja/genre/drama?p=2`） |
| canonical | 自己参照。`?p=2` のページは `?p=2` を指す |
| 旧 `/p/N` 形式 | `next.config.ts` の `redirects()` で恒久リダイレクト |
| sitemap | 1ページ目のみ列挙する。`?p=N` は載せない |

### 実装方法

一覧ページは SSG のため `getStaticProps` からクエリを読めない。`middleware.ts` で `?p=N`（N≧2）を内部的に `/p/N` ルートへ **rewrite** する（URL は `?p=N` のまま）。

```ts
// middleware.ts
const url = request.nextUrl.clone();
url.pathname = `/${locale}/${taxonomy}/${slug}/p/${pageNum}`;
url.searchParams.delete('p');
return NextResponse.rewrite(url);
```

> **注意:** i18n 有効時、`/ja/genre/foo` でも middleware に渡る `pathname` は `/genre/foo` になることがある。接頭辞あり・なしの両方を受け、`nextUrl.locale` で補完すること。これを怠ると rewrite が効かず常に1ページ目が表示される。

### 例外: `movie` / `anime` / `drama` / `vod`

これらは `/page/N` 形式（`?page=N` を rewrite）で先に実装されている。**新規の一覧ページは `?p=N` に統一する。**

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
