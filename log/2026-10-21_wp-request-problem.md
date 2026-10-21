# WP へのリクエスト問題（2026-10-21）

WP を止めたときに表示が壊れないよう、「実行時に WP へリクエストしている箇所」を洗い出して塞いだ記録。

## 調査で分かったこと（指示書の前提との差分）
| 指示書の記述 | 実際 |
|---|---|
| Next.js 15 | Next.js 16.3（Pages Router） |
| 「SSR で毎リクエスト WP を取得」 | `getServerSideProps` は `sitemap.xml` と `server-sitemap.xml` の 2 ファイルだけ。他は `getStaticProps`（ISR） |
| ISR の挙動 | `open-next.config.ts` が `defineCloudflareConfig()` のみ（incremental cache が `dummy`）で、**事前生成物が実行時に使われず、毎回 `getStaticProps` が走る** |

つまり「SSR を SSG に置換する」のではなく、**実行時に WP へ取りにいく経路をすべて塞ぐ**のが本質だった。

## WP へ実行時にリクエストしていた経路と対策
| 経路 | 内容 | 対策 |
|---|---|---|
| ISR 再生成 / `fallback: 'blocking'` | 未生成パス、`revalidate` 経過後に WP を取得。`paths: []` のページが多数 | 凍結時は `fallback: false`、`revalidate` なし。全パスをビルド時に列挙 |
| 事前生成物が使われない | incremental cache が `dummy` | 事前生成物を静的アセットから読む incremental cache に変更（下記） |
| サイトマップ | `server-sitemap.xml` を実行時に WP から生成 | ビルド時に `public/*.xml` を生成。SSR ページは削除 |
| API ルート | `/api/search` `/api/high-score` `/api/vod-related` `/api/actor-works` `/api/category-filter-posts` `/api/revalidate` | 凍結時は 503 + `{"maintenance":true}`。WP を呼ばない |
| クライアント fetch | 検索、一覧の絞り込み・並び替え、記事詳細の付随機能（他作品・高スコア・VOD 関連） | 検索・絞り込みはメンテナンス表示、付随機能は非表示（取得しない） |
| 画像 | Next の画像最適化が実行時に WP から取得 | [画像問題](2026-10-21_image-problem.md) |

> ブラウザから `cms.katsumascore.blog` を直接叩く箇所は無かった（すべて自サイトの `/api/*` 経由）。

## 実機検証で見つけた 2 つの落とし穴
1. **`open-next.config.ts` の `process.env` 分岐は効かない。** Worker にバンドルされると実行時式になり、環境変数の無い Worker では `dummy` に戻って実行時再生成（= WP 取得）が復活する。→ 無条件で設定する。
2. **Next 16.3 のキーと OpenNext 1.20.7 のファイル配置が食い違う。** Next は `/route-cache/PAGES/<hash>/$/ja/anime/foo` というキーで参照するが、OpenNext の静的アセットキャッシュは `ja/anime/foo.cache` というパス名で配置する。標準の `staticAssetsIncrementalCache` では全リクエストが cache miss になった。→ キー変換ラッパー `open-next.freeze-cache.ts` を追加（依存は更新していない）。

## ビルド時の WP 取得の負荷対策
ConoHa は過去に 503/507/403 を返したことがあるため、ビルドで WP に負荷をかけず、失敗を握りつぶさない。
- 同時リクエストは 4 件以下。
- 5xx / 429 / ネットワークエラーは指数バックオフで最大 3 回再試行。401 / 403 は即失敗。
- 同一 URL の GET はプロセス内でキャッシュ（上限 256MB）。
- 再試行しても失敗したら **`process.exit(1)` でビルドを中止**する。既存のエンドポイント関数は失敗を `null` / 空配列に丸めるため、例外では止まらないので `fetch` を差し替えて実現した（`src/libs/freeze/wpFetchGuard.ts`）。
- 列挙結果が 0 件（記事・person・tag）、ジャンルが 0 件の場合もビルドを中止する。

## 既存の暫定対応との違い
`docs/develop/BUILD_WP_UNREACHABLE.md` の暫定対応は「取得失敗時に 404 を焼き付けず、空一覧を生成してビルドを続行」する方針。凍結ビルドでは**空データのデプロイが最悪の結果**になるため、逆に失敗させる。

## 検証できたこと / できていないこと
- できた: モックデータでのビルド成功。`prerender-manifest` で `revalidate` を持つルートが 0 件、動的ルートの `fallback` がすべて `false`。`wrangler dev` で WP を到達不能にして起動し、TOP・一覧・記事詳細（ja/en）・VOD・季節レビュー・サイトマップが表示され、存在しないパスは 404、`/api/*` は 503。フェッチガードの単体テスト（再試行・キャッシュ・並列・恒久失敗で終了）。
- できていない: 実 WP でのビルド、生成ページ数と公開件数の照合、`wrangler deploy` / `wrangler tail`（調査環境から WP に到達できず、Cloudflare 認証情報もない）。
