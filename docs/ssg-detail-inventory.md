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

## 10. 2026-10-22 ローカル再調査・実装方針（コード変更前）

公開 REST を読み取り確認した。`per_page=1` の `X-WP-Total` は posts **603**、pages **20**、persons **1,158**、companies **92**、franchise **63**、seasonal_review **2**、theater_release **11**、vod_release **7**。人物・企業・franchise は共通データを ja/en 両方へ生成する。記事は ACF lang の言語だけ生成する。概算は `603 + (20 + 1158 + 92 + 63 + 2 + 11 + 7) × 2 = 3,309`。固定ルートとの衝突除外、階層ページ、旧季節レビューURLの分を補正するため、実際の件数は生成マニフェストで照合する。「記事数×言語数」は翻訳を自動生成する意味ではない。

- `series` は WP に存在するが詳細フロント未実装。`episode_review` / `short_post` もフロント未実装なので追加しない。
- 追加CPT `seasonal_review` / `theater_release` / `vod_release` も実装済み詳細ページとしてSSG化する。actor はカテゴリ一覧なのでISRを維持する。
- 固定ページは `/pages` 全件を列挙し、既存の固定Nextルートと階層を尊重する。季節まとめ子ページは既存の専用ルートへ列挙する。
- 記事はカテゴリと言語で正しいルートだけを列挙する。全件ページネーションに上限10ページを設けない。
- VOD配信フラグは既に生成時のACF。日付を getStaticProps でJST生成して表示し、VOD関連記事も生成時取得へ戻す。キャスト他作品・高スコアのCSRは対象外として維持する。
- WP fetch を共通化し、秘密ヘッダー、同時4件、5xx/429/通信失敗の最大3回再試行、ビルド中のレスポンス共有を実装する。通信障害を既存catchで握りつぶさない。Nextビルドのワーカー数も制限する。
- 既存デプロイワークフローへ日次/手動トリガーを統合し、二重デプロイ経路を作らない。Dependabot由来pushはマージコミット本文も確認して除外する。
- `open-next.config.ts` の dummy cache を解消する。読み取り専用static-assets cacheでは一覧ISRとblocking生成の保存が成立しないため、公式のR2 incremental cache + Durable Object queueを採用する。**画像R2移行とは別のページキャッシュ**。R2バケットの作成・WAF/Secrets設定・本番デプロイは今回実行しない。OpenNextに関する詳細・検証記録は規定の `docs/develop/opennext_pages_router_custom_404.md` に集約する。

### コード外の準備と検証境界

- WAFとSecretsの設定は仕様書の人間側作業どおり。値をコード・ログに記録しない。
- ページキャッシュ用R2/DO構成と準備手順は [OpenNext記録](develop/opennext_pages_router_custom_404.md#2026-10-22-詳細ssgと一覧isrの併用) を参照する。
- GitHubの通知設定でActions失敗メールを受け取る設定を有効にする。ワークフローのerror annotationだけではメール受信設定までは変更できない。
- 本番WPへの新規記事公開、workflow_dispatchによる本番デプロイ、改修後の本番PageSpeed計測は今回のローカルコード検証に含めない。blocking/404はモックとローカルサーバーで検証する。
- 月間利用時間は実Actionsの所要時間×約30回に通常push/手動実行を加算する。ローカル計測からFree枠に収まるとは断定しない。

## 11. 実装・ローカル検証結果（2026-10-23 JST）

- 実WPを使う `npm run build` 成功。Next.js 16.3.8、Webpack、1ワーカー、**615秒（10分15秒）**。全体の生成対象は3,576ページ。
- 対象詳細は **3,347ページ**。`prerender-manifest.json` の実数で照合し、すべて `initialRevalidateSeconds: false`、動的ルートの `fallback: null`（blocking）を確認した。

| 詳細ルート | 生成数 |
|---|---:|
| `/movie/[slug]` | 518 |
| `/anime/[slug]` | 84 |
| `/drama/[slug]` | 1 |
| `/[slug]`（固定ルート衝突除外後） | 30 |
| `/person/[slug]` | 2,316 |
| `/company/[slug]` | 184 |
| `/franchise/[slug]` | 126 |
| `/seasonal-reviews/[slug]` | 26 |
| `/seasonal-anime-and-dramas-reviews/[slug]`（旧URL） | 26 |
| `/theater-release/[slug]` | 22 |
| `/vod-release/[slug]` | 14 |

記事合計603はWP公開件数と一致。人物1,158×2、企業92×2、franchise63×2も一致。page20件から既存固定ルートと衝突する5件を除き15×2。季節レビューはCPT2件と旧子ページ11件を各言語・新旧ルートへ生成するので13×2×2。週次記事は11×2と7×2。

- TOP `/ja`・`/en` は従来どおり300秒、映画・アニメ・ジャンル一覧の確認例は86,400秒。今回一覧のrevalidate値は変更していない。
- 記事・固定ページ・人物・企業・franchise・季節・週次記事のja/en計19URLをローカルHTTPで確認し200。dramaは日本語1件のみ。存在しない記事は404。
- 公開WPへ新規投稿する代わりに、生成済みパスにないモック記事をproduction serverで確認した。初回は200/MISS、2回目は200/HIT、日付はいずれも生成日の `2026/10/23`。モックの不存在パスも404。
- 最新コードを `next dev --webpack` とChromeで確認。SP/PCスクリーンショットを取得し、JST日付が見えること、`/api/vod-related` の通信が0件であることを確認。配信サービス名の純粋変換を通信モジュールから分離した後、最新のブラウザ向けチャンクに `WP_BUILD_TOKEN` / `x-build-token` が含まれないことも確認した。
- `npm run lint`、`tsc --noEmit`、`npm run test:ssg`（8検査）、`npm run test:wp-schema`（2検査）、YAML/JSON構文検証、`git diff --check` 成功。
- Next devが追記したAGENTS.mdのNext.jsガイド案内は維持した。ビルド中に生成されたgenres.jsonの実データ更新はコード変更に含めない。
- 既存データに起因する警告：franchiseの1ページが128KBの推奨データ量を超える。featuredカテゴリはWPに存在せず、既存featuredページと一部英語一覧は従来の判定で404。今回の対象詳細に生成失敗/404はない。
- 未実施：Cloudflare向けバンドルの実ビルド・R2/DO上のISR検証・Actions手動本番デプロイ・本番WPへの公開後の導線確認・デプロイ前後のPageSpeed比較。これらは本番準備後に検証する。コード側でSSG化できたことと、本番配信が検証済みであることを混同しない。
