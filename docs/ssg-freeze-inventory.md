# SSG 切り替え 事前調査（Step 0）

- 作成日: 2026-10-21
- 目的: PHP 重大脆弱性（CVE-2026-109618 / 109619）に伴う WordPress 停止に備え、実行時に WP へアクセスしない構成へ一時切り替えする。
- 調査はリポジトリのコード読解のみ。**調査環境（Claude Code クラウド）から `cms.katsumascore.blog` へ到達できなかった（HTTP 000）** ため、WP の実データに基づく項目（公開件数・総ページ数）は未確認で、式のみ示す。

---

## 0. 指示書の前提と実コードの差分（最重要）

| 指示書の記述 | 実際 |
|---|---|
| Next.js 15 Pages Router | **Next.js 16.3**（`package.json`: `next ^16.3.1`）、Pages Router |
| 「SSR で毎リクエスト WP を取得」 | `getServerSideProps` は **`sitemap.xml` と `server-sitemap.xml` の2ファイルのみ**。他は全て `getStaticProps`（ISR、`revalidate` あり）。ただし下記の理由で**実行時には毎回 WP を取得している**可能性が高い |
| ISR の挙動 | `open-next.config.ts` は `defineCloudflareConfig()` のみで **incremental cache 未設定（`dummy`）**。ビルド時の事前生成 HTML は実行時に読み出されず、リクエストごとに `getStaticProps` が走る（`docs/develop/opennext_pages_router_custom_404.md` の「Incremental Cache との関係」と一致） |

結論: **「`getServerSideProps` → `getStaticProps`」の置換ではなく、次の3点が本質になる。**

1. `fallback: 'blocking'` / `revalidate` を廃止し、全パスをビルド時に列挙する（`fallback: false`）。
2. 事前生成した HTML を実行時に読み出す incremental cache（`staticAssetsIncrementalCache`）を有効にする。これが無いと、SSG にしても実行時に WP を取りにいく。
3. **WP 取得失敗時に空データ・404 を焼き付ける既存の暫定対応を、ビルド失敗に変える**（`docs/develop/BUILD_WP_UNREACHABLE.md` の暫定対応と逆方向。凍結用ビルドでは「空データのままデプロイ」が最悪の結果になるため）。

### 現状で WP 停止時に起きること（対応しない場合）

- ISR の再生成（`revalidate` 経過後・`fallback: 'blocking'` の未生成パス）で WP 取得が失敗すると、一覧系は `buildEmptyCategoryListPage` で**空一覧を生成**、`/actor` 等は 404 を返す。
- dummy cache のため、キャッシュ以前に**全リクエストが WP 取得を伴う**。

---

## 1. `getServerSideProps` を export しているページ

| ファイル | ルート | 取得している WP | 備考 |
|---|---|---|---|
| `src/pages/sitemap.xml.tsx` | `/sitemap.xml` | **なし**（固定の静的パスのみ） | SSR である必要は無い |
| `src/pages/server-sitemap.xml.tsx` | `/server-sitemap.xml` | `getSitemapPosts(100,10)` / `getCategories` / `getGenres` / `getTags` / `getAllFranchiseSlugs` / `getChildPages` / `getPersons(100)` / `getVodReleases` / `getSeasonalReviews` / `getTheaterReleases` / `resolveSeasonalReviewParentId` | 要・ビルド時静的生成化 |

---

## 2. ページ別レンダリング方式（`getStaticProps` 系）

`fallback` 列が `blocking` のものは、未生成パスへのアクセスで実行時に WP を取得する。

| ルート | ファイル | revalidate | fallback | getStaticPaths の現状 |
|---|---|---|---|---|
| `/`（TOP） | `pages/index.tsx` | HIGH(300s) | - | - |
| `/top` | `pages/top.tsx` | なし | - | - |
| `/[slug]`（固定ページ） | `pages/[slug].tsx` | HIGH | blocking | `getFeaturedPages()` を各ロケールで列挙 |
| `/movie` `/anime` `/drama` | `pages/{type}/index.tsx` | DAILY | - | - |
| `/{type}/[slug]`（記事詳細） | `pages/{type}/[slug].tsx` → `libs/loadPostDetailPage.ts` | `makeGetStaticProps` 内（300s / notFound 60s） | blocking | `getSitemapPosts(100,10)`（最大1000件）× ロケール。**3種別とも全記事スラッグを同一列挙**（種別の判別なし） |
| `/{type}/page/[page]` | `pages/{type}/page/[page].tsx` | DAILY | blocking | **`paths: []`**（全て実行時生成） |
| `/person` | `pages/person/index.tsx` | DAILY | - | - |
| `/person/[slug]` | `pages/person/[slug].tsx` | DAILY | blocking | **`paths: []`** |
| `/company/[slug]` | `pages/company/[slug].tsx` | DAILY | blocking | **`paths: []`** |
| `/franchise/[slug]` | `pages/franchise/[slug].tsx` | LOW(3600s) | blocking | `getAllFranchiseSlugs()`（ロケール指定なし） |
| `/actor/[slug]` | `pages/actor/[slug].tsx` | HIGH | blocking | `getCategoriesForArchiveResolve` から列挙 |
| `/genre/[slug]` | `pages/genre/[slug]/index.tsx` | DAILY | blocking | `src/data/genres.json`（`generate-genres.mjs` がビルド前に WP から生成） |
| `/genre/[slug]/p/[p]` | `pages/genre/[slug]/p/[p].tsx` | DAILY | blocking | **`paths: []`** |
| `/tag/[slug]` | `pages/tag/[slug]/index.tsx` | NORMAL(600s) | blocking | `getTags()` から列挙 |
| `/tag/[slug]/p/[p]` | `pages/tag/[slug]/p/[p].tsx` | NORMAL | blocking | **`paths: []`** |
| `/vod` | `pages/vod/index.tsx` | DAILY | - | - |
| `/vod/[slug]` | `pages/vod/[slug]/index.tsx` | DAILY | blocking | **`paths: []`** |
| `/vod/[slug]/page/[page]` | `pages/vod/[slug]/page/[page].tsx` | DAILY | blocking | **`paths: []`** |
| `/vod-release`, `/vod-release/[slug]` | `pages/vod-release/` | DAILY | blocking（詳細） | 詳細は `paths: []` |
| `/theater-release`, `/theater-release/[slug]` | `pages/theater-release/` | DAILY | blocking（詳細） | 詳細は `paths: []` |
| `/now-showing` | `pages/now-showing/index.tsx` | NORMAL | - | - |
| `/featured` | `pages/featured.tsx` | NORMAL | - | - |
| `/seasonal-reviews`, `/seasonal-reviews/[slug]` | `pages/seasonal-reviews/` | NORMAL / HIGH | blocking | `getSeasonalReviews()`（空なら固定ページ由来） |
| `/seasonal-anime-and-dramas-reviews`, `/[slug]` | 旧スラッグ。`[slug]` は上記を re-export | NORMAL | blocking | 同上 |
| `/about` `/contact` `/privacy-policy` | 各 `.tsx` | なし | - | WP 取得なし想定（要確認） |
| `/search` | `pages/search.tsx` | なし（SSG シェル） | - | 結果は client fetch |
| `/404` | `pages/404.tsx` | - | - | - |

**`paths: []` + `fallback: 'blocking'` のページが多数ある**ため、これらは全件列挙の実装が必要（指示書 Step 1 のとおり）。

### i18n

`next.config.ts`: `locales: ['default','ja','en']`, `defaultLocale: 'default'`, `localeDetection: false`。`middleware.ts` が `default` ロケールを `/ja` へ 307 リダイレクトする。パス列挙では `default` を除外し `ja` / `en` を使う（既存コードと同じ）。franchise / person / company は現状ロケール指定なしの `paths`。**ロケールごとに生成すべきかは本番 URL（`/ja/franchise/x` 等）の運用を確認して決める。**

### ページネーションの URL 構造（変更しない）

`middleware.ts` が `?p=N`（genre / tag）と `?page=N`（movie / anime / drama / vod）を内部的に `/p/N` `/page/N` へ rewrite している。中間ルートは既に動的ルートとして存在するため、**静的列挙すれば URL 構造は変えずに済む**。ミドルウェアはエッジで動き WP を呼ばない。

---

## 3. WP REST API を呼んでいる関数（`src/libs/api/wordpress/`）

共通: `WP_API_URL`（`wrangler.jsonc` の `vars`: `https://cms.katsumascore.blog/wp-json/wp/v2`）。`openapi-fetch` クライアント（`client.ts`、`_embed=1&acf_format=standard` を自動付与）と、一部は生 `fetch`。既定は `timeoutMs 3000` / `maxRetries 2` / バックオフ 500ms〜。**失敗時は `null` / 空配列を返す**。同時実行制限・プロセス内キャッシュは無い。

| ファイル | 主な関数 | 備考 |
|---|---|---|
| `endpoints/posts.ts` | `getPosts` `getPostsWithMeta` `getPostBySlug` `getRelatedPosts` `searchPosts` 等 | `_fields`, `per_page`, `page`, `categories`, `tags`, `genre`, `vod`, `franchise`, `slug`, `search`, `include` |
| `endpoints/sitemapPosts.ts` | `getSitemapPosts(perPage, maxPages)` | 軽量取得（約21KB）。記事スラッグ列挙に利用 |
| `endpoints/categories.ts` `categoryList.ts` | `getCategories` `getCategoryList` | 一覧ページの本体 |
| `endpoints/genre.ts` `tags.ts` `vodTaxonomy.ts` | タクソノミー取得 | |
| `endpoints/franchise.ts` | `getFranchiseBySlug` `getAllFranchiseSlugs` | |
| `endpoints/persons.ts` `personRelatedPosts.ts` | person | |
| `endpoints/companies.ts` `companyRelatedPosts.ts` | company | |
| `endpoints/pages.ts` | `getPageBySlug` `getFeaturedPages` `getChildPages` | **`fetch` に `signal`/リトライ無し** |
| `endpoints/seasonalReview.ts` | 季節まとめ | |
| `endpoints/vodList.ts` `vodRelease.ts` `theaterList.ts` `theaterRelease.ts` | カスタムエンドポイント（`wp-json` 直下） | |
| `endpoints/homeCurated.ts` | TOP のキュレーション枠 | |
| `scripts/generate-genres.mjs` | `genres.json` 生成 | `prebuild` で実行。**失敗しても空配列を書き出して続行**（凍結ビルドでは失敗させるべき） |

その他の WP 依存: `src/libs/wpMockMode.ts`（`USE_WP_MOCK=true` で `src/mocks/wp` の固定データ。**ビルド確認用に使えるが、本番データではない**）。

---

## 4. `pages/api/` で WP を呼んでいるもの

| ルート | 用途 | 呼び出し元（クライアント） |
|---|---|---|
| `/api/search` | 検索 | `pages/search.tsx` |
| `/api/high-score` | 高スコア記事（スコア4以上） | `hooks/useHighScorePosts.ts`（TOP等のサイドバー） |
| `/api/vod-related` | VOD 関連記事 | `hooks/useVodRelatedPosts.ts`（記事詳細） |
| `/api/actor-works` | 出演者の他作品 | `components/features/Post/PostTitleMeta/useActorWorks.ts`（記事詳細） |
| `/api/category-filter-posts` | 一覧のフィルタ・ページ送り | `libs/useCategoryPagedPosts.ts`（movie/anime/drama 一覧） |
| `/api/revalidate` | On-demand ISR（POST、WP から呼ばれる） | WP 側。凍結中は不要 |
| `/api/hello` | 動作確認 | WP 無関係 |

---

## 5. クライアント（ブラウザ）から WP 依存の API を呼んでいる箇所

ブラウザから直接 `cms.katsumascore.blog` を叩く箇所は無い。**すべて自サイトの `/api/*` 経由**（= Worker が実行時に WP を取得する）。

| 箇所 | 呼び先 | 凍結時の扱い（案） |
|---|---|---|
| `pages/search.tsx` | `/api/search` | メンテナンス表示（指示書 Step 3） |
| `useHighScorePosts` | `/api/high-score` | ビルド時に props へ埋め込む（または非表示）。要判断 |
| `useVodRelatedPosts` | `/api/vod-related` | 同上 |
| `useActorWorks` | `/api/actor-works` | 同上 |
| `useCategoryPagedPosts` | `/api/category-filter-posts` | **一覧のフィルタ・ページ送り**。2ページ目以降は静的ページへ遷移で代替できるが、フィルタは停止 or ビルド時全件同梱が必要。要判断 |

> 指示書 Step 3 は「呼び出しをやめ、メンテナンス表示」としているが、`high-score` / `vod-related` / `actor-works` は記事詳細・TOP の**付随コンテンツ**。全部を「メンテナンス中」にすると記事詳細の見た目が欠ける。ビルド時埋め込みにするか、単に非表示にするかの方針確認が必要。

---

## 6. 動的ルートの一覧と、パス列挙に必要なデータ

| ルート | 必要データ | 取得元 | ロケール |
|---|---|---|---|
| `/{movie,anime,drama}/[slug]` | 記事 slug（+ 記事の `lang`） | `getSitemapPosts(100,10)` | ja / en |
| `/{movie,anime,drama}/page/[page]` | カテゴリ別の総ページ数（2〜N） | `X-WP-TotalPages`（per_page は `*_LIST_PER_PAGE`） | ja / en |
| `/[slug]` | 固定ページ slug | `getFeaturedPages` | ja / en |
| `/person/[slug]` `/company/[slug]` | slug | `getPersons` / `getCompanies` | 要確認 |
| `/franchise/[slug]` | slug | `getAllFranchiseSlugs` | 要確認 |
| `/actor/[slug]` | カテゴリ slug | `getCategoriesForArchiveResolve` | ja / en |
| `/genre/[slug]` + `/p/[p]` | genre slug、各総ページ数 | `genres.json` / `getPostsWithMeta` | ja / en |
| `/tag/[slug]` + `/p/[p]` | tag slug、各総ページ数 | `getTags` / `getPostsWithMeta` | ja / en |
| `/vod/[slug]` + `/page/[page]` | `VOD_ARCHIVE_PATH_SLUGS`（静的定義）、各総ページ数 | `libs/vodPathToWpSlug.ts` | ja / en |
| `/vod-release/[slug]` `/theater-release/[slug]` | slug | `getVodReleases` / `getTheaterReleases` | 要確認 |
| `/seasonal-reviews/[slug]` | slug | `getSeasonalReviews` | ja / en |

### 想定ページ数（式）

実データ未取得のため概算式のみ。ビルドログで種別ごとの件数を出力して照合する（Step 5・6）。

- 記事詳細 = 公開記事数 × 言語数（現行 `getSitemapPosts` の上限は 100×10 = **1000件**。超過分は列挙漏れになるため、凍結ビルドでは全ページ取得に変更が必要）
- 記事一覧 = 3種別 × 2言語 × `ceil(件数 / per_page)`
- genre / tag = (slug 数 × 2言語) + 各 `ceil(件数 / per_page) - 1` ページ分
- person / company / franchise / actor / 固定ページ / VOD / 劇場公開 / 季節まとめ = 各 slug 数（× 言語数）
- 固定ページ（TOP・about 等）= 数十

---

## 7. `next.config.ts` の設定

- `i18n`: 上記のとおり。
- `images`: `remotePatterns` は `https://cms.katsumascore.blog/wp-content/uploads/**`。`formats: avif/webp`。`unoptimized` は **開発時のみ**。→ **本番は Next の画像最適化経由で WP 上の画像を取得する**。
  - 指示書 Step 4 は「画像 URL は変えない。画像だけは WP 停止中も配信される設定にする（人間側で対応）」としている。ただし最適化済み画像は Worker が実行時に WP から取得するため、`.htaccess` で uploads を許可する前提でも**画像が Worker 経由で WP に到達する**点は事前に認識しておく（「ページ表示で WP へリクエストしない」という完了条件 1 との関係。画像は例外扱いか要判断）。
- `headers()`: `Cache-Control`（`s-maxage` + `stale-while-revalidate`）を全般に付与。SSG 化後も有効。
- `redirects()`: `/author/:slug` `/:year/:month` → 404、`/genre|tag/:slug/p/:page` → `?p=:page` へ 301。WP 非依存。
- `rewrites`: 無し（`middleware.ts` で実現）。
- `sassOptions`: ビルド時のみ。

---

## 8. `@opennextjs/cloudflare` の設定

- `open-next.config.ts`: `defineCloudflareConfig()` のみ → **incremental cache 無効（dummy）**。
- `wrangler.jsonc`: `main: .open-next/worker.js`, `assets` バインディング `ASSETS`（`.open-next/assets`）。**R2 / KV バインディングは無い**。`vars.WP_API_URL` が実行時にも設定されている。
- 凍結に必要な変更案: `staticAssetsIncrementalCache`（静的アセットとして配置したキャッシュを読み取り専用で利用）を `open-next.config.ts` に設定する。R2 を使わないため新規インフラ不要。対応可否は `@opennextjs/cloudflare` のインストール済みバージョンで確認する（このセッションでは `node_modules` 未導入）。
- 実行時の WP ベース URL を到達不能ホストへ差し替えて検証する（Step 6）には、`WP_API_URL` を `wrangler dev --var` 等で上書きする。

---

## 9. サイトマップ・RSS・robots.txt

| 対象 | 生成方法 | WP 取得 | 凍結時 |
|---|---|---|---|
| `/sitemap.xml` | `getServerSideProps` | なし | 静的生成へ |
| `/server-sitemap.xml` | `getServerSideProps` | **あり**（多数） | ビルド時に静的ファイルとして生成 |
| `/feed` | **実装なし**（`next.config.ts` のヘッダ設定に名前があるのみ） | - | 対応不要 |
| `robots.txt` | `public/robots.txt`（静的） | なし | 対応不要 |

---

## 10. 検証できていないこと（このセッションの制約）

- WP 実データに依存する値（公開件数・総ページ数・実際の生成ページ数）
- 実ビルド（`opennextjs-cloudflare build`）と `wrangler deploy` / `wrangler tail`（WAF 回避のためローカル Mac で実行する前提。本セッションはクラウド上で WP に到達できず、Cloudflare 認証情報も無い）
- `node_modules` 未導入のため、ここでは lint / typecheck / ビルドを未実行

実装後に確認できるのは、`USE_WP_MOCK=true` でのビルド成否、型・lint、列挙ロジックの単体確認まで。**Step 6 の実データ照合・WP 停止再現テスト・デプロイ後の `wrangler tail` 確認は、ローカル Mac での実施が必要。**
