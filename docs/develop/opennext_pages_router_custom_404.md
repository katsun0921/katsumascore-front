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
