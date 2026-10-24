# OpenNext Pages Router カスタム 404 問題

## ステータス

- 調査日: 2026-09-10
- 状態: 未解決
- 対象: Next.js 16.3.4 / `@opennextjs/cloudflare` 1.20.6
- 追跡先: [opennextjs-cloudflare PR #1346](https://github.com/opennextjs/opennextjs-cloudflare/pull/1346)

上流 PR が未マージのため、現時点ではプロジェクト固有の Worker ラッパーを追加せず、公式修正のリリースを待つ。

## 症状

Pages Router の動的ルートで `getStaticProps` または `getServerSideProps` が `{ notFound: true }` を返すと、HTTP ステータスは 404 になる一方、`pages/404.tsx` が描画されない。レスポンス本文は `This page could not be found` のみになる。

| 確認 URL | HTTP ステータス | 結果 |
| --- | ---: | --- |
| `/ja/vod/amazon-prime-video-jp?tag=sharks` | 404 | `This page could not be found` のみ |
| `/ja/vod/<存在しないslug>` | 404 | `This page could not be found` のみ |
| `/ja/404` | 404 | `pages/404.tsx` のカスタム HTML を表示 |
| `/ja/vod/prime-video?tag=sharks` | 200 | 正常な VOD 詳細ページを表示 |

期待する結果は、存在しない動的ルートでも HTTP 404 を維持し、`pages/404.tsx` のカスタム HTML を返すことである。

## 原因

Next.js 16.3 系の Pages Router では、ルートが `notFound` を返した場合に `routerServerContext.render404` を使ってカスタム 404 を描画する。このコールバックが登録されていない場合、Next.js のルートハンドラーは `This page could not be found` を直接返す。

OpenNext は Next.js のリクエストハンドラーを直接呼び出しているが、初回リクエストの前に `render404` が登録されていない。上流 PR #1346 は、この初期化処理を追加して Pages Router の `notFound` 結果でもカスタム 404 を描画する修正である。

## Incremental Cache との関係

`open-next.config.ts` の `staticAssetsIncrementalCache` は、ビルド時に事前生成された HTML と ISR キャッシュを実行時に読み出すための設定である。これを設定することで `dummy` キャッシュによる毎回の再生成は解消できるが、今回のカスタム 404 描画問題は解消しない。

両者は同じ OpenNext 実行環境で発生しているが、原因と修正箇所は別である。

## バージョンを戻す場合の注意

`@opennextjs/cloudflare` だけを 1.20.2 に戻しても、Next.js 16.3.0 との組み合わせでは同じ現象を確認している。バージョンを戻す場合は、Next.js と OpenNext を互換性のある組み合わせで固定し、動的ルートの 404 を含む統合確認を行う必要がある。

公式修正がリリースされるまでは依存関係の変更を行わず、PR #1346 のマージとリリースを確認してから更新する。

## 修正版への更新後に確認すること

- 存在しない VOD slug が HTTP 404 を返す
- `getStaticProps` / `getServerSideProps` の `notFound` で `pages/404.tsx` が描画される
- レスポンスの `content-type` が `text/html` になる
- 存在しない通常パスでもカスタム 404 が描画される
- `/ja/404` の直接表示が引き続き正常に動作する
- 存在する VOD 詳細ページが HTTP 200 で表示される
- ISR ページで `x-nextjs-cache` が継続的に `MISS` にならず、キャッシュが利用される

## 参考資料

- [OpenNext PR #1346: Pages Router の `notFound` でカスタム 404 を描画する修正](https://github.com/opennextjs/opennextjs-cloudflare/pull/1346)
- [Next.js: Custom Error](https://nextjs.org/docs/pages/building-your-application/routing/custom-error)

## 2026-10-22 詳細SSGと一覧ISRの併用

- ローカルの `open-next.config.ts` は `defineCloudflareConfig()` のみ、incremental cache 未設定だった。依存ライブラリの static-assets 実装は読み取り専用で `set/delete` に対応せず、一覧ISRと未生成パスのblocking生成を永続化できない。
- 対応：公式の `r2IncrementalCache` + `doQueue`、`NEXT_INC_CACHE_R2_BUCKET`、`NEXT_CACHE_DO_QUEUE`、`WORKER_SELF_REFERENCE` を設定する。R2はページキャッシュ専用で、画像URL/保存先は変更しない。
- `wrangler deploy` 直接実行を `opennextjs-cloudflare deploy` に変更する。同コマンドはデプロイ前に生成済みキャッシュをR2へ投入する（ローカル依存の `dist/cli/commands/deploy.js` で確認）。previewもOpenNext経由でキャッシュを投入する。
- デプロイ前の準備：R2バケット `katsumascore-incremental-cache` を作成し、デプロイトークンにR2書き込み権限を与える。DOはWrangler migration v1で作成する。WAFの秘密ヘッダー除外とActions Secret `WP_BUILD_TOKEN` も必要。これらの本番操作は今回未実施。
- 参照：[OpenNext公式キャッシュ構成](https://opennext.js.org/cloudflare/caching)。タグベースの再検証は今回追加しない。既存 `/api/revalidate` の動作は本番相当環境で別途確認が必要。
- 検証結果は本節へ追記する。R2/DO未作成・WAF未設定状態では本番デプロイを実行しない。

### 2026-10-23 ローカル検証結果

実WPのNextビルドは615秒で成功、詳細3,347件はすべてrevalidateなし・blocking。production `next start` 上で未生成モック記事を初回200/MISS、2回目200/HIT、生成時JST日付保持、不存在404として確認した。一覧/TOPのISR秒数も維持されている。これはNodeサーバーでの検証であり、Cloudflare R2/DOによる永続化・キュー再生成・本番CPU制限を確認したものではない。Cloudflareバンドルの実ビルド、WAF/Secrets/R2準備後のActions実行と本番ISR検証は未実施。


### 2026-10-23 WAF移行前の互換動作を維持

確定方針に従い、WP取得失敗でビルドを中断する条件を「WP_BUILD_TOKEN登録済みのビルド」に限定した。未設定のActionsも実行可能とし、403時は既存のnull/空データへの復旧と空パス+blockingを使う。ジャンル事前取得と生成数レポートも同じ条件にそろえた。トークンはWAFの秘密ヘッダー除外設定後に登録し、その時点から403を含む取得失敗を致命的に扱う。`BUILD_WP_UNREACHABLE.md` に残る過去の403によるデプロイ停止を、無条件throwで再発させないための変更である。条件切替のモック検証は完了したが、WAF/Secrets変更やCloudflare本番デプロイは実施していない。


## 2026-10-23 PR #259の緊急SSG実装を恒久構成へ取り込む

参照PR：[緊急対応のSSG切り替え #259](https://github.com/katsun0921/katsumascore-front/pull/259)。調査時のheadは `12158d79c520d31af16bc99e345fe5c383ddc013`。PR全体の差分と、以下の実装を比較した。PR自体のマージや緊急ブランチの変更は行っていない。

| 参照実装 | 判断と今回の適用 |
|---|---|
| [`open-next.freeze-cache.ts`](https://github.com/katsun0921/katsumascore-front/blob/12158d79c520d31af16bc99e345fe5c383ddc013/open-next.freeze-cache.ts) | **キー互換の考え方を採用**。読み取り専用static-assets実装は採らず、R2の実行時値を優先して、未保存のPagesだけ事前生成のパスキーへフォールバックする。 |
| [`src/libs/freeze/wpFetchGuard.ts`](https://github.com/katsun0921/katsumascore-front/blob/12158d79c520d31af16bc99e345fe5c383ddc013/src/libs/freeze/wpFetchGuard.ts) | **256MiBの保持上限、本文を保持してResponseを毎回再構築する方式を採用**。ArrayBufferのbyteLengthで計算し、未消費のResponse.cloneストリームを保持しない。204/205の本文はnullとする。 |
| [`scripts/summarize-freeze-build.mjs`](https://github.com/katsun0921/katsumascore-front/blob/12158d79c520d31af16bc99e345fe5c383ddc013/scripts/summarize-freeze-build.mjs) | **種別×言語の実数集計を採用**。既存のNext生成マニフェスト集計へ `countsByLocale` を追加した。OpenNextキャッシュファイルの件数を検証したという意味ではない。 |
| [`src/libs/freeze/enumeratePaths.ts`](https://github.com/katsun0921/katsumascore-front/blob/12158d79c520d31af16bc99e345fe5c383ddc013/src/libs/freeze/enumeratePaths.ts) | 全ページ取得・ja/en列挙・記事のカテゴリ/ACF言語による絞り込みは恒久実装で対応済み。今回は既存の無制限ページネーションと正規URL判定を維持する。 |

### R2でも発生する事前生成キャッシュのキー不一致

PRの実機記録を受け、ローカル依存の実装を確認した。

- NextのPages実行時キーは `/route-cache/PAGES/<source hash>/$/ja/movie/example`。
- OpenNextのキャッシュ投入処理 `getCacheAssets` は、配置パスから `/ja/movie/example` をキーにする。
- R2の `computeCacheKey` は渡されたキー全体のSHA-256を使うため、2つのキーは別のR2オブジェクトになる。
- 旧ローカル依存のOpenNext 1.20.7で発見した後、`npm ci` でlockfileどおりの **OpenNext 1.20.12 / Next 16.4.2** に揃えた。同じR2実装に対するテストでも、パスキーで投入したページを実行時キーから直接読めないことを再現した。package.json/package-lock.jsonのバージョン指定は変更していない。

対応は `src/libs/cache/prerenderedPagesCache.ts`。`get` は元のキーを優先し、missしたPagesキャッシュだけパスキーを参照する。App Router・fetch・composableキーには変換を適用しない。事前生成データのlastModifiedも変更しない。`set` は元のキーへ書き込み、ISRとblocking生成の保存・キーの区別を維持する。`delete` は元のキーと対応する事前生成キーの両方を削除し、削除後に古いseedへ戻ることを防ぐ。`name` は `cf-r2-incremental-cache` のままとし、OpenNextのR2投入処理を有効に保つ。

### 採用しなかった緊急対応

- static-assetsの読み取り専用キャッシュ・`set/delete` のno-op：一覧ISRとblocking生成の保存が必要なため。
- `fallback: false`・全ページSSG化：一覧ISRに新記事のリンクが現れる現在の要件と合わないため。
- 画像のダミー差し替え、検索/APIの503化、関連記事等の停止、サイトマップの全面静的化：WP停止時専用の変更で、今回の範囲外。
- 30分TTLのビルドをまたぐディスクキャッシュ：日次ビルドでは新しいデータを取り、前回の取得値を持ち越さないため。プロセス内の共有だけを維持し、新しい生成ディレクトリは追加しない。
- globalThis.fetchの置換・process.exitによる無条件終了・再試行5回：現在の共通通信入口、同時4件、最大3回再試行、トークン登録済みビルドだけ中断する方針を維持するため。
- 全コレクションへの一律0件禁止：正常な空コレクションと取得失敗を区別し、未設定時の互換動作を保つため。

### 検証と範囲

- 実際のOpenNext R2実装を、メモリ上のR2バインディング代替に接続して検証した。キー不一致の再現、seed読み出し、元の日時の維持、ISR更新値の優先、blocking生成値の保存、削除後にseedが復活しないこと、fetch/App Routerへの非適用を確認した。Cloudflareの実R2にアクセスしたテストではない。
- WPキャッシュは小さい上限値で超過応答の非保持・取得中の共有・失敗後の回復を確認。既存の通信制限・トークン条件・言語・生成日付・404復旧の検査も通過した。
- `npm run test:ssg` 13検査、`npm run test:wp-schema` 2検査、`npm run typecheck`、`npm run lint`、`git diff --check` が成功。OpenNext設定のR2名・get/set/delete・DOキューも読み込み確認した。
- 既存の3,347件の生成マニフェストから言語別集計を確認（ja 1,735 / en 1,612 / default 0）。これは既存ビルドの再集計で、今回の変更後・依存を揃えた後の全件再ビルドではない。
- Cloudflare向けの新規バンドル生成、R2/DOの実機検証、本番デプロイは未実施。WAF・Secrets・R2の準備後に、WPを読まなくても事前生成済みページを返せることと、一覧ISR・新規パス生成の両立を確認する。

## 2026-10-23 Node.js・Next.js・OpenNextのバージョン調査

今回は調査のみで、package.json・lockfile・Node実行環境の変更は行っていない。

| 項目 | 指定 | lockfile / 実インストール | 確認結果 |
|---|---|---|---|
| Node.js | enginesと.node-versionが25.8.1 | 実行環境25.8.1 | 指定と実体は一致。ただし25系列は2026-06-01でサポート終了 |
| npm | packageManager / enginesが11.11.0 | 実行環境11.11.0 | Node要件は `^20.17.0 || >=22.9.0`。Node 24.22.1でも条件を満たす |
| next | ^16.3.1 | 16.4.2 / 16.4.2 | npmのlatestも16.4.2。Next自体のNode要件は>=20.9.0 |
| eslint-config-next / @next/env / @next/eslint-plugin-next | configは16.4.2固定 | 全て16.4.2 | 現在のNextと一致 |
| @opennextjs/cloudflare | ^1.20.12 | 1.20.12 / 1.20.12 | peer Nextは `>=15.5.28 <16 || >=16.4.1`。現在の16.4.2は範囲内 |
| @opennextjs/aws | 間接依存 | 4.1.11 / 4.1.11 | 同じNext peer条件 |
| @types/node | ^26 | 26.6.5 | Node実行環境25とはメジャー不一致。24へ移行する場合は型も24系へ合わせる候補 |
| vitest | ^5.0.0 | 5.0.5 | Node要件 `^22.12.0 || ^24.0.0 || >=26.0.0` にNode25が含まれない |
| sharp | Nextの間接依存 | 0.35.5 | 2026-10-14のNextセキュリティ情報に記載された修正版の条件を満たす |

### 判断

- **優先はNodeを24.22.1 LTSへ揃えること**。公式スケジュールでは24は2026-10-20からMaintenance LTS、2028-04-30までサポート予定。26は調査日にはまだCurrentで、LTS開始予定は2026-10-28。
- lockfile内の依存のenginesをmacOS arm64とCIのLinux x64それぞれで照合した。Node25ではVitestが不適合、24.22.1ではルートのNode25固定指定を除いて対象プラットフォームの依存に不適合はなかった。これは宣言上の確認であり、Node24での実ビルド検証は未実施。
- 現在のNext16.4.2とOpenNext1.20.12はpeer条件上整合している。package.jsonのNext下限 `^16.3.1` はOpenNextの許容しない版も含むため、将来変更時には `^16.4.2` または16.4.2固定など、下限・固定方針を揃える候補とする。既存lockfileのnpm ciで16.3が選ばれるという意味ではない。
- OpenNext最新は1.20.13（2026-10-21公開）。Next15のサポート判定、Server Actionsのredirect host、Webpackの名前付きチャンクに対する修正。今回追加したPagesのキャッシュキー互換処理を不要にする修正という記載はない。更新は別途ビルド検証して判断する。
- Cloudflare本番はローカルNode25そのものではなく、Workersのnodejs_compat上で動く。Nodeの選択は開発/CIのビルド・テスト環境の問題として扱う。

参照：

- [Node公式リリーススケジュール](https://raw.githubusercontent.com/nodejs/Release/main/schedule.json)
- [Node 24.22.1 LTS（2026-10-21セキュリティリリース）](https://nodejs.org/en/blog/release/v24.22.1)
- [npm公式レジストリのNext latest](https://registry.npmjs.org/next/latest)
- [Nextの2026-10-14セキュリティ情報](https://nextjs.org/blog/nextjs-security-update-october-14-2026)
- [Vitest 5.0.5のpackage.json](https://raw.githubusercontent.com/vitest-dev/vitest/v5.0.5/packages/vitest/package.json)
- [OpenNext 1.20.12](https://github.com/opennextjs/opennextjs-cloudflare/releases/tag/@opennextjs%2Fcloudflare@1.20.12)
- [OpenNext 1.20.13](https://github.com/opennextjs/opennextjs-cloudflare/releases/tag/@opennextjs%2Fcloudflare@1.20.13)

## 2026-10-23 Node.js 24 LTSへの移行

Node.js 25系列のEOLとVitest 5のNode要件を踏まえ、`.node-version` と `package.json` の `engines.node` を24.22.1へ変更した。Actionsは既存の `node-version-file: package.json` から同じバージョンを使用する。`@types/node` は24系へ揃え、lockfileでは24.19.2（依存するundici-typesは7.24.6）を固定した。npm 11.11.0、Next.js 16.4.2、OpenNext 1.20.12は維持した。

ローカルのHomebrew `node@24` は実体が25.8.1を指していたため、公式配布の24.22.1を `/tmp` に取得して検証した。システム全体のNodeのリンクは変更していない。ローカル開発でも24.22.1を有効にする必要がある。

Node 24.22.1 + npm 11.11.0で `npm run typecheck`、`npm run lint`、`npm run test:ssg`（64件）、`npm run test:wp-schema`（2件）が成功した。SSGテストのモックサーバーはサンドボックス内でlocalhost待受が拒否されたため、制限外で再実行して成功を確認した。今回のNode変更後の本番ビルド・Cloudflareデプロイは未実施。

### 2026-10-24 Node 24.22.1でのビルド検証

公式配布のNode 24.22.1（SHASUMS256で照合）+ npm 11.11.0で `npm ci --engine-strict` が成功し、エンジン不適合はなかった。続けて以下を確認した。

- `npm run test:ssg`（65件）、`npm run test:wp-schema`（2件）、`npm run typecheck`、`npm run lint`、`npm run lint:scss` が成功。
- `USE_WP_MOCK=true` で `npm run build`（`scripts/build-ssg.mjs`）が成功。詳細33件を生成し、生成数レポートの検査（revalidateなし・blocking）を通過。`/[slug]` はjaのみ事前生成（3件）。
- 同条件で `npx opennextjs-cloudflare build` が成功し、`.open-next/worker.js` を出力。警告は `compatibility_date: 2026-03-30` の更新推奨のみ。

モックデータでのビルドであり、実WPでのビルド、R2/DO/WAF/Secrets準備後のActions実行、Cloudflareへのデプロイは未実施。

## 2026-10-24 npm auditの脆弱性修正

`npm audit` で21件（low 2 / moderate 5 / high 14）を再現した。通常の `npm audit fix --ignore-scripts` で7件まで減少したが、OpenNextの間接依存に残るglobとundiciについては `--force` がOpenNext 1.20.9へのダウングレードを提案した。この提案は適用せず、依存先を限定したoverridesで修正版を指定した。

- `@node-minify/core` の固定依存glob 10.3.3を10.5.0へ変更。[GHSA-5j98-mcp5-4vw2](https://github.com/advisories/GHSA-5j98-mcp5-4vw2)の修正版で、同じ10系を維持する。OpenNext側の利用はglobSyncだが、CLIを含む脆弱な依存自体を置き換えた。10.5.0にもnpmの旧系列廃止警告は出るため、上流の依存更新後にoverrideの撤去を検討する。
- `miniflare` の固定依存undici 7.29.1を7.30.1へ変更。同じ7系の修正版に限定する。
- lockfile上のOpenNext Cloudflareは1.20.12から1.20.13、AWSは4.1.11から4.1.12、Wranglerは4.151.0から4.152.0、Miniflareは5.20261012.0-betaから5.20261019.2-betaへ更新。Next 16.4.2とReact 19.3.1は維持した。
- 通常の監査修正でViteが7.3.2から8.3.5へ更新された際、StorybookのCSS最小化で既存の `@media (min-width: var(--breakpoint-lg))` に対する `Invalid media query` が発生した。不要なメジャー更新を避け、devDependenciesにVite `^7.3.7` を明記して修正済み7系へ揃えた。

型チェックと初回のNextビルドは、古い `.next/dev/types/validator.ts` に残る削除済みAPI `src/pages/api/vod-related.js` への参照で失敗した。生成済みのdev用型ディレクトリを `/tmp` へ退避すると型チェックは成功した。ソースやtsconfigを変更する必要はなかった。

Node 24.22.1 / npm 11.11.0でSSGテスト65件、WPスキーマテスト2件、Lintが成功。`USE_WP_MOCK=true` でCloudflare向けビルドも成功し、詳細33件と `.open-next/worker.js` を生成した。監査は0件となった。実WPによる全件ビルド、Cloudflareへのデプロイ、実R2/DO上の検証は未実施。

最終lockfileで `npm ci --engine-strict` とVite 7.3.7によるStorybookビルドも成功し、クリーンインストール後の監査も0件だった。CloudflareビルドはViteの7系への固定前に実施した（ViteはStorybook用の開発依存）。

## 2026-10-24 PR #260マージ後のActions失敗

- PR #260はJST 19:03:12にmainへマージされた（`2a635b24bd10e1fc48b27ac5a103dade937373b6`）。自動起動した [Deploy Cloudflare Workers #202](https://github.com/katsun0921/katsumascore-front/actions/runs/40084378670) は失敗した。
- 依存インストールは成功。OpenNextから起動した `npm run build` のprebuildで、`generate-genres.mjs --required` が `generate-genres failed: HTTP 403` を返して停止した。Nextのページ生成・R2へのキャッシュ投入・Workerデプロイには到達していない。
- Actionsでは `WP_BUILD_TOKEN` が設定済みであり、ジャンル取得失敗を致命的に扱う条件が有効だった。コードは共通の `wpFetch` を経由してWP RESTへ `x-build-token` を付与する。403の発生源（Cloudflare WAF・オリジン側制限等）と具体的な遮断ルールはログだけでは確定していない。
- 次の確認：実行時刻（UTC 10:03:42前後）のWAFイベント、RESTのgenreパスに対する除外範囲、WAF側の照合値とActions Secretの一致、他の遮断ルールの適用を確認する。値そのものはコード・ログに記録しない。解消後にActionsを再実行し、実WPでの全件生成とR2/DO配信を検証する。設定変更・再実行は未実施。

### ConoHa設定の確認と応答診断の追加

- ユーザー確認では、ConoHaの海外アクセス制限はREST-APIがOFF、ダッシュボード/XML-RPC API/wlwmanifest.xmlがON、Abilities APIがOFF。ConoHa WAFログに該当記録はない。これだけでは遮断元を確定できず、既存記録の「ConoHa WAFが原因」という記述も推定として扱う。
- `generate-genres.mjs` の非2xx応答に診断ログを追加した。HTTPステータス、既知のServer/Content-Type分類、CF-Rayの有無、Cloudflare challengeヘッダー、本文のCloudflare/ConoHa/Forbidden Access/WordPress RESTエラー形式の有無を出力する。Cloudflareの痕跡があっても、経由しただけか遮断したのかは追加調査が必要。
- 本文は最大16KiBまで読み、URL・Cookie・任意のヘッダー値・本文の生値は出さない。秘密値が応答に反射されてもログへ出さず、固定の分類値と真偽値だけを記録する。厳格モードによるビルド停止は維持する。
- 次回、修正を含むActions実行の `[generate-genres] WP response diagnostics:` を確認する。従来の失敗ジョブを再実行するだけでは古いコミットを使うため、この診断は追加されない。今回の変更は診断追加であり、403解消や本番反映を確認したものではない。
- ローカル検証：`npm run test:ssg` は68件成功（localhost待受制限のためサンドボックス外で実行）、`npm run typecheck` 成功。反射された秘密値の非出力、本文読み取り上限、子プロセスの実ログと403時の異常終了維持を確認した。
