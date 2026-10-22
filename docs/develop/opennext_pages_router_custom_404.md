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
