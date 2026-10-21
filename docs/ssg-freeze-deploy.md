# SSG 凍結ビルド・デプロイ手順（WordPress 停止対応）

- 作成日: 2026-10-21
- 背景: PHP 重大脆弱性（CVE-2026-109618 / 109619）に伴い、WordPress（`cms.katsumascore.blog`）を停止する可能性がある。停止中も実行時に WP へアクセスせずサイトを表示するため、全ページをビルド時に生成して配信する。
- 事前調査: [`ssg-freeze-inventory.md`](ssg-freeze-inventory.md)
- ブランチ: 凍結用の変更は専用ブランチ（`main` へはマージしない）。復旧は `main` を再デプロイするだけで元に戻る。

---

## 1. 何が変わるか

| 項目 | 通常（main） | 凍結ブランチ（`NEXT_PUBLIC_SSG_FREEZE=1`） |
|---|---|---|
| 動的ルート | `fallback: 'blocking'`（未生成パスは実行時に WP 取得） | **`fallback: false`**。全パスをビルド時に列挙 |
| ISR | `revalidate` あり | **なし**（`isr()` が空を返す） |
| 実行時のキャッシュ | OpenNext 既定 `dummy`（毎回再生成） | **事前生成物を静的アセットから読み取り専用で配信**（`open-next.config.ts` / `open-next.freeze-cache.ts`） |
| サイトマップ | `getServerSideProps` で実行時生成 | **ビルド時に `public/*.xml` を生成**（SSR ページは削除） |
| `/api/search` ほか WP を呼ぶ API | WP を取得して返す | **503 + `{"maintenance":true}`**（WP へアクセスしない） |
| 検索ページ | 検索結果を表示 | 「現在メンテナンス中のため、この機能は一時停止しています。」を表示 |
| 一覧の絞り込み・並び替え | CSR で API 取得 | 事前生成した一覧を表示し、メンテナンス文言を表示 |
| WP 画像（アイキャッチ・本文内画像など） | `next/image` で WP から取得・最適化 | **非表示**（WP へリクエストしない） |
| 記事詳細の「出演者の他作品」「高スコア記事」「VOD 関連記事」 | CSR で API 取得 | **非表示**（取得しない） |
| ビルド時の WP 取得 | 失敗しても空データで続行 | 同時4件・5xx は最大3回再試行・同一 URL は1回だけ取得。**失敗したらビルド中止** |

> `open-next.config.ts` は環境変数で切り替えず無条件に静的アセットキャッシュを使う。`process.env` 分岐は Worker にバンドルされると実行時式になり、環境変数の無い Worker では `dummy` に戻って**実行時に再生成（= WP 取得）してしまう**ことを実機検証で確認したため。

## 2. ビルドとデプロイ（ローカル Mac で実行）

GitHub Actions のランナー（Azure, ASN 8075）は WAF「Block Azure ASN to cms」で WP へ到達できないため、**必ずローカルで実行する**。

```bash
git checkout <凍結ブランチ>
npm ci
# .env 相当: WP_API_URL=https://cms.katsumascore.blog/wp-json/wp/v2 を環境変数で与える（コミットしない）
export WP_API_URL=https://cms.katsumascore.blog/wp-json/wp/v2
export NEXT_PUBLIC_SITE_URL=https://katsumascore.blog

# 1) ビルド（ジャンル取得 → サイトマップ生成 → next build → OpenNext → 事前生成物を静的アセットへ配置 → 件数集計）
npm run build:freeze 2>&1 | tee ssg-freeze-build.log

# 2) ローカル確認（任意・§3 の WP 停止再現テストを推奨）
npx wrangler dev --var WP_API_URL:http://127.0.0.1:9/wp-json/wp/v2

# 3) 本番デプロイ
npx wrangler deploy
```

`npm run deploy:freeze` は 1) と 3) をまとめて実行する。

### ビルドログで見るもの

- `[ssg-freeze] paths <種別>: N` … `getStaticPaths` が列挙した件数（種別ごと）
- 末尾の「生成ページ数（ルート別 / ロケール別）」 … 実際に生成されたページ数
- 列挙数と生成数の差 = `notFound` になったパス（想定外に多ければ調査する）
- `[ssg-freeze] WordPress の取得に失敗したためビルドを中止します` … WP 側の問題。デプロイしない
- `[ssg-freeze] <種別> が 0 件` … 空データのデプロイ防止で中止している

## 3. 検証チェックリスト（デプロイ前）

1. 生成ページ数が WP の公開件数と一致する（記事数 × 言語数、各一覧のページ数など）。記事は `getSitemapPosts` の全件（1000 件超対応）から列挙する。
2. 次を数件ずつ開いて表示確認する: 記事詳細（ja / en）、各一覧の1ページ目と最終ページ、person、company、franchise、series、タグ、ジャンル、VOD、季節レビュー、固定ページ。
3. 存在しないパスが 404 になる。
4. **WP 停止の再現テスト**: `npx wrangler dev --var WP_API_URL:http://127.0.0.1:9/wp-json/wp/v2` で起動し、全ページが表示されること・`/api/*` が 503 になること・検索ページが「メンテナンス中」になることを確認する。
5. デプロイ後に `npx wrangler tail` を開き、ページ閲覧時に `cms.katsumascore.blog` へのリクエストが出ないことを確認する。

## 4. 既知の制約・要確認事項

- **画像（一時的に非表示）**: WP へのリクエストに例外を設けない方針のため、`/wp-content/` を含む画像はすべて描画しない。
  - `next/image` は webpack alias（`next.config.ts`）で `src/libs/freeze/FreezeImage.tsx` に差し替え、WP 画像の src なら何も描画しない（アイキャッチ、ヒーロー、人物写真、ロゴ以外の WP 画像すべて）。
  - 記事本文 HTML の `<img>` / `<source>`（`/wp-content/` を含むもの）と、インライン style の `url(.../wp-content/...)` は `stripWpImagesFromHtml` で除去（`PostContent` / `VodIntroduction`）。
  - `public/` 配下の画像や他ホストの画像（TMDB 等）は対象外で、そのまま表示される。
  - OGP・JSON-LD の画像 URL は文字列として残る（ページ表示時に取得されない。SNS クローラーが取得しに来る場合は WP 側が停止していれば失敗する）。
  - 復旧時は `main` をデプロイし直せば画像は元に戻る。
- **一覧のフィルタ・並び替え**: 停止中は利用不可（事前生成した並びを表示）。ページ送りは静的ページ遷移で動く。
- **記事詳細の付随機能**（他作品・高スコア・VOD 関連）: 停止中は非表示。
- **`/api/revalidate`**: 凍結中は 503。WP からの再生成通知は無効。
- 本手順のモック検証（`USE_WP_MOCK=true`）では、`getTagBySlug` 等モック未対応の関数があるため tag ページなどが生成されない。実データでは生成される想定で、**実 WP でのビルドログ確認が必須**。

## 5. 復旧手順

1. ConoHa の修正適用を確認し、WordPress を再開する。
2. `main` をデプロイし直して SSR/ISR 構成へ戻す（`main` の `open-next.config.ts` は `defineCloudflareConfig()` のまま）。
3. 凍結ブランチは削除せずに残す（再発時に再利用する）。
4. `public/sitemap.xml` / `public/server-sitemap.xml` は `.gitignore` 済みの生成物。`main` では SSR ページが元の `sitemap.xml` を返す。
