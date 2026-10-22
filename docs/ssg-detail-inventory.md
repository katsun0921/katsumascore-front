# 詳細ページSSG化 Step 0 調査結果

- 調査日：2026-10-21
- 調査対象：`main`（`2d00e0f`）
- 指示書：`ssg-partial-instructions.md`（詳細ページの恒久的なSSG化）

> 調査環境（クラウドコンテナ）から `cms.katsumascore.blog` へは接続できない（プロキシが拒否）。
> そのため **生成ページ数は実測できず、コードからの見積もりのみ**。実数はローカルまたは Actions で確認する。

---

## 1. 前提の差異（指示書と現状）

| 指示書の記載 | 現状 |
|---|---|
| `hotfix/ssg-wp-freeze` と `docs/ssg-freeze-inventory.md` がある | リモートに該当ブランチなし、ファイルもなし。流用できない |
| CPT: `franchise` / `series` / `episode_review` / `short_post` / `person` / `company` | フロントのテンプレートがあるのは **`franchise`（実体は taxonomy）・`person`・`company`** のみ。`series` / `episode_review` / `short_post` は **未実装** |
| 現在は ISR（`getServerSideProps` もあり得る） | 詳細ページはすべて `getStaticProps`（`revalidate` 付き）。**詳細ページに `getServerSideProps` はない**（SSR は `server-sitemap.xml` のみ） |
| 詳細ページで VOD 配信状況を実行時取得している | 実行時取得は「VOD 関連記事」（`/api/vod-related`）のみ。配信状況（`streamingVods`）は §4 参照 |

---

## 2. 詳細ページ一覧

| 種別 | ファイル | ルート | 現在の方式 | revalidate | `getStaticPaths` | SSG化対象 |
|---|---|---|---|---|---|---|
| post | `src/pages/movie/[slug].tsx` | `/movie/:slug` | ISR | 300 | `getSitemapPosts` で全件 | ○ |
| post | `src/pages/anime/[slug].tsx` | `/anime/:slug` | ISR | 300 | 同上 | ○ |
| post | `src/pages/drama/[slug].tsx` | `/drama/:slug` | ISR | 300 | 同上 | ○ |
| page | `src/pages/[slug].tsx` | `/:slug`（WP固定ページ） | ISR | `REVALIDATE_HIGH`(300) | `getFeaturedPages` | ○ |
| franchise | `src/pages/franchise/[slug].tsx` | `/franchise/:slug` | ISR | `REVALIDATE_LOW`(3600) | `getAllFranchiseSlugs` | ○ |
| person | `src/pages/person/[slug].tsx` | `/person/:slug` | ISR | `REVALIDATE_DAILY` | **空配列** | ○ |
| company | `src/pages/company/[slug].tsx` | `/company/:slug` | ISR | `REVALIDATE_DAILY` | **空配列** | ○ |
| seasonal_review | `src/pages/seasonal-reviews/[slug].tsx`（`seasonal-anime-and-dramas-reviews/[slug].tsx` は再エクスポート） | `/seasonal-reviews/:slug` | ISR | `REVALIDATE_HIGH` | あり | 要判断 |
| theater_release | `src/pages/theater-release/[slug].tsx` | `/theater-release/:slug` | ISR | `REVALIDATE_DAILY` | **空配列** | 要判断 |
| vod_release | `src/pages/vod-release/[slug].tsx` | `/vod-release/:slug` | ISR | `REVALIDATE_DAILY` | **空配列** | 要判断 |
| series / episode_review / short_post | なし | — | — | — | — | **未実装** |

ISR のまま残す（Step 5）：`index.tsx`（TOP）、`top.tsx`、`movie|anime|drama/index.tsx` と `page/[page].tsx`、`tag/[slug]`、`genre/[slug]`、`vod/*`、`featured.tsx`、`actor/[slug].tsx`（WP **category** のアーカイブ。CPT ではない）、`person/index.tsx` など。

SSG済み（`revalidate` なし）：`about.tsx`。

---

## 3. WP REST API を呼ぶ共通関数

- 配置：`src/libs/api/wordpress/`
  - `client.ts`：`wpApiBaseUrl`（`WP_API_URL`）、openapi-fetch クライアント、`defaultFetchOptions`（timeout 3s / retry 2 / backoff 500ms）、`shouldRetryStatus`（429・5xx）
  - `endpoints/*.ts`：**エンドポイントごとに `fetch(url, { signal })` を直接呼んでいる（約20箇所）**。ヘッダー付与・並列数制限・キャッシュの共通入口はない
  - `endpoints/posts.ts`：`getPostBySlug` / `getRelatedPosts` / `getPostsByFranchiseTermId` など
  - `endpoints/sitemapPosts.ts`：`getSitemapPosts`（`_fields` 絞り込み、`X-WP-TotalPages` で全ページ取得、timeout 15s）。`getStaticPaths` が利用
- 付随：`src/libs/loadPostDetailPage.ts`（movie/anime/drama 共通の `makeGetStaticPaths` / `makeGetStaticProps`）

**Step 3 への影響：** 秘密ヘッダー・同時実行制限・ビルド内キャッシュ・失敗時のビルド中断を入れるには、`fetch` を共通ラッパーに集約する必要がある（約20ファイルの置換）。openapi-fetch 側は `client.use()` のミドルウェアで対応できる。

---

## 4. 詳細ページ内の実行時データ

| データ | 取得場所 | 方法 |
|---|---|---|
| 記事本文・ACF・`streamingVods`（配信サービス一覧） | `getStaticProps`（`getPostBySlug` → `buildPostDetailFromWp`） | サーバー側（ビルド/ISR時） |
| 関連記事（relation / postsGroups） | `getStaticProps`（`getRelatedPosts`） | サーバー側 |
| フランチャイズ関連（最大3件・ランダム） | `getStaticProps`（`getPostsByFranchiseTermId`） | サーバー側。`Math.random()` のため **ビルドごとに内容が変わる** |
| ジャンルナビ | `getStaticProps`（`loadStaticGenreNavTags`） | サーバー側 |
| **VOD 関連記事（ランダム3件）** | `useVodRelatedPosts` → `/api/vod-related` | **クライアント側**（Worker CPU 超過対策で CSR 化されている） |
| キャスト他作品 | `useActorWorks` → `/api/actor-works` | **クライアント側** |
| ハイスコア記事 | `useHighScorePosts` → `/api/high-score` | クライアント側 |

**確認が必要な点：** 指示書の「VOD配信状況」が `streamingVods`（既にビルド時取得）なのか、`/api/vod-related`（実行時取得）なのかを確認する。
`streamingVods` であれば既に静的データで、日付表示の追加のみ。`/api/vod-related` を指す場合は、SSG化すると `/api/*`（Worker）が不要になりCSRをやめられる。

---

## 5. 言語ルーティング

- Next.js `i18n`：`locales: ['default', 'ja', 'en']`、`defaultLocale: 'default'`、`localeDetection: false`（`next.config.ts`）
- `getStaticPaths` は `locale: 'ja' | 'en'` ごとにパスを返す（`default` は除外）
- 言語の正は ACF `lang`（`detectLang`）。`postLang !== loc` なら `notFound`
- `middleware.ts` が一覧系（`/movie` 等）のロケール補完と `?p=` / `?page=` の rewrite を担当（詳細ページは対象外）

**注意：** `makeGetStaticPaths` は全記事スラッグ × ja/en の **直積** を返す。言語が違う組み合わせは `getStaticProps` で `notFound`（`revalidate: 60`）になるため、SSG化でビルド時に大量の404生成と WP リクエストが発生する。`getSitemapPosts` は `acf.lang` を取得済みなので、言語でフィルタして直積を避けられる。

---

## 6. 生成ページ数の見積もり

WP 非接続のため実数は不明。式：

```
post:       (公開記事数 ja) + (公開記事数 en)      ← lang で絞る場合
            記事数 × 2                              ← 絞らない場合（半数が404生成）
page:       getFeaturedPages の件数 × 2
franchise:  タームの数（ロケール別パスなし → default のみ）
person:     person CPT 件数 × 言語数
company:    company CPT 件数 × 言語数
```

`getSitemapPosts(100, 10)` は最大1,000件で打ち切り。記事数が1,000を超えると取りこぼす。

---

## 7. GitHub Actions の構成

| ワークフロー | トリガー | 内容 |
|---|---|---|
| `deploy-cloudflare-workers.yml` | `push: main` / `workflow_dispatch` | `npm ci` → `npm run deploy`（`opennextjs-cloudflare build && wrangler deploy`）。`concurrency: cloudflare-workers-deploy` |
| `update-packages.yml` | 毎週月曜 / 手動 | パッケージ更新PR作成 |
| `ui-test.yml` / `deploy-storybook.yml` / `url-leak-check.yml` / `pr-*.yml` | PR等 | テスト・Storybook・PR記述 |

- Dependabot ブランチ（`dependabot/npm_and_yarn/...`）と `chore/auto-update-packages` が存在。自動マージ後は `push: main` でデプロイが走る。
- 既存の `concurrency.group` は `cloudflare-workers-deploy`（指示書は `deploy-production`）。

**判断（案）：** 既存ワークフローを改修する。トリガーを増やすだけで、シークレット・ビルド手順・concurrency が共通のため。新規作成すると二重デプロイの経路ができる。

---

## 8. 既知のビルド時の問題（`docs/develop/BUILD_WP_UNREACHABLE.md`）

- Actions から WP へ **HTTP 403**（Azure ASN ブロック）。今回の秘密ヘッダー対応の前提。
- 取得失敗時に `throw` するとビルド全体が失敗する（2026-08-10 発生）。
- **指示書の「取得失敗ならビルドを失敗させる」は、WAF 書き換え前に有効化するとデプロイ不能になる。** 順序の調整が必要。

---

## 9. 緊急対応（PR #259）から流用できるもの

PR #259（`ccr-fa1ec93e-efnobs`、`NEXT_PUBLIC_SSG_FREEZE=1` で全ページSSG）の調査・実装を確認した。

### 重要な発見：incremental cache が `dummy`

`open-next.config.ts` は `defineCloudflareConfig()` のみで、incremental cache が未設定（`dummy`）。
**ビルド時に生成したHTMLは実行時に読み出されず、リクエストごとに `getStaticProps`（= WP取得）が走る。**
「SSGの方がISRより速い」のは、緊急対応で `staticAssetsIncrementalCache` を有効にしたことによる可能性が高い。
単に `revalidate` を外すだけでは、詳細ページは速くならない。

### 流用候補

| 部品 | 場所（PR #259） | 指示書のStep | 流用時の変更点 |
|---|---|---|---|
| WP取得ガード（同時実行制限・再試行・キャッシュ・失敗時中止） | `src/libs/freeze/wpFetchGuard.ts` | Step 3 | 判定を `NEXT_PUBLIC_SSG_FREEZE` から `WP_BUILD_TOKEN` の有無へ変更。`x-build-token` ヘッダーを付与。同時4件・再試行3回に合わせる |
| 全件パス列挙 | `src/libs/freeze/enumeratePaths.ts` | Step 1 | 対象を詳細ページに限定。`acf.lang` で絞る |
| 静的アセット incremental cache | `open-next.freeze-cache.ts` | （指示書に記載なし） | **ISR のままの一覧・TOPとの両立に設計判断が必要（下記）** |

### 設計判断が必要な点

`open-next.freeze-cache.ts` は読み取り専用（`set` / `delete` は何もしない）。これを全体に適用すると、ISR のままにするTOP・一覧も **ビルド時のHTMLを返し続け、再生成されなくなる**。
指示書の「TOP・一覧はISRのまま」と矛盾するため、方針を決める必要がある。

### 流用しないもの

画像のダミー差し替え、`/api/*` の503化、サイトマップのビルド時生成、`fallback: false`、ローカルMac前提のデプロイ手順。いずれも「WP停止」前提で、今回の恒久対応とは目的が異なる。
