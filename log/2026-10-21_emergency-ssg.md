# 緊急対応としての SSG（2026-10-21）

WP 停止に備え、**全ページをビルド時に生成し、実行時に WP へアクセスしない**構成へ一時的に切り替える対応。経緯は [PHP の問題](2026-10-21_php-vulnerability.md)、個別の論点は [WP へのリクエスト問題](2026-10-21_wp-request-problem.md) と [画像問題](2026-10-21_image-problem.md) を参照。

- 作業ブランチ: `ccr-fa1ec93e-efnobs`（指示書の `hotfix/ssg-wp-freeze` ではなく、セッションで指定されたブランチ）
- 切り替えスイッチ: `NEXT_PUBLIC_SSG_FREEZE=1`
- 事前調査: [`docs/ssg-freeze-inventory.md`](../docs/ssg-freeze-inventory.md)
- 手順書: [`docs/ssg-freeze-deploy.md`](../docs/ssg-freeze-deploy.md)

## 経過
1. **Step 0 調査**: 指示書の前提（SSR）が実コードと違うことを確認し、結果を報告。
2. **実装**: ページの SSG 化、全件パス列挙、ビルド時の取得ガード、incremental cache、メンテナンス表示、サイトマップの静的生成。
3. **実機検証**: `wrangler dev` で WP を到達不能にして起動し、cache miss で実行時再生成が走ることを発見。原因を 2 点特定して修正。
4. **画像**: WP へのリクエスト例外なしの方針に従い、非表示→レイアウト崩れ→ダミー画像へ。
5. **マージ可否の確認**: `main` へのマージでは凍結版はビルドされず、むしろ本番が壊れる点を整理（下記）。

## 変更の概要
| 領域 | 内容 | 主なファイル |
|---|---|---|
| 切り替え | `isSsgFreeze` / `freezeFallback` / `isr` | `src/libs/freeze/ssgFreeze.ts` |
| ページ | `revalidate` を `...isr(n)` に、`fallback` を `freezeFallback()` に置換（約 30 ページ） | `src/pages/**` |
| 全件列挙 | 記事（種別・言語別）、一覧 2 ページ目以降、person、company、franchise、tag、genre、VOD、劇場公開 など。件数をログ出力 | `src/libs/freeze/enumeratePaths.ts` |
| 取得ガード | 同時 4 件・再試行 3 回・キャッシュ・失敗時ビルド中止 | `src/libs/freeze/wpFetchGuard.ts`（`client.ts` から導入） |
| キャッシュ | 事前生成物を静的アセットから配信（Next 16.3 のキー形式に対応） | `open-next.config.ts` / `open-next.freeze-cache.ts` |
| API | 503 + `{"maintenance":true}` | `src/libs/freeze/withFreezeGuard.ts` |
| UI | 検索ページ・一覧の絞り込みにメンテナンス文言。付随機能は取得しない | `search.tsx` / `ListTemplate` / 各 hooks |
| サイトマップ | ビルド時に `public/sitemap.xml` / `server-sitemap.xml` を生成（SSR ページは削除） | `scripts/generate-sitemaps.mts` / `src/libs/sitemap/buildSitemaps.ts` |
| 画像 | WP 画像をダミー画像に差し替え | `src/libs/freeze/FreezeImage.tsx` / `hideWpImages.ts` / `public/images/freeze-dummy.svg` |
| スクリプト | `build:freeze` / `preview:freeze` / `deploy:freeze`、生成ページ数の集計 | `package.json` / `scripts/summarize-freeze-build.mjs` |
| ジャンル | 凍結ビルドでは取得失敗・0 件でビルド中止 | `scripts/generate-genres.mjs` |

### 記事詳細の列挙ルール
サイトマップと同じ規則に揃えた。カテゴリ（movie / anime / drama）から種別を決め、ACF `lang` のロケールでのみ列挙する。複数カテゴリに属する記事は該当する種別のそれぞれで生成される。上限は `getSitemapPosts` の 1000 件を撤廃し全件取得。

## 凍結中の機能の状態
| 機能 | 状態 |
|---|---|
| 全ページ（記事・一覧・person・company・franchise・tag・genre・VOD・季節レビュー・固定ページ） | 事前生成、WP へアクセスしない |
| 一覧のページ送り | 静的ページ遷移で動く |
| 一覧の絞り込み・並び替え | 停止（事前生成の並びを表示、メンテナンス文言） |
| 検索 | 停止（メンテナンス文言） |
| 記事詳細の「出演者の他作品」「高スコア」「VOD 関連」 | 非表示 |
| `/api/revalidate` | 503（WP からの再生成通知は無効） |
| WP 画像 | ダミー画像 |

## 検証結果
- 確認済み: 型チェック・lint・`test:wp-schema`、モックでの凍結ビルド、`wrangler dev` での WP 到達不能テスト、フェッチガード単体テスト。
- `npm run lint:ui` の構造チェックは SCSS 欠落などを指摘するが、変更前から出ているもの。
- **未確認（ローカル Mac での実施が必要）**: 実 WP でのビルドと生成ページ数の照合、`wrangler deploy`、`wrangler tail` で `cms.katsumascore.blog` へのリクエストが出ないこと。モックでは `getTagBySlug` 等が未対応で tag ページが生成されないため、実データのビルドログ確認が必須。

## ビルド・デプロイ（概要。詳細は手順書）
GitHub Actions のランナー（Azure, ASN 8075）は WAF「Block Azure ASN to cms」で WP に到達できないため、**ローカル Mac で実行**する。
```bash
export WP_API_URL=https://cms.katsumascore.blog/wp-json/wp/v2
export NEXT_PUBLIC_SITE_URL=https://katsumascore.blog
npm run build:freeze 2>&1 | tee ssg-freeze-build.log
npx wrangler dev --var WP_API_URL:http://127.0.0.1:9/wp-json/wp/v2   # 停止再現テスト
npx wrangler deploy
```

## `main` へのマージについて（重要）
- `main` への push で動く `Deploy Cloudflare Workers` は `npm run deploy`（通常ビルド）を実行するため、**マージしても凍結版はビルド・デプロイされない**。
- 一方で、マージすると本番が壊れる:
  - 元の `sitemap.xml` / `server-sitemap.xml` の SSR ページを削除しており、通常ビルドではサイトマップを生成しないため **404 になる**。
  - `open-next.config.ts` が常に凍結用キャッシュを使うため、通常ビルドでは空の読み取り専用キャッシュになる。
- 推奨: **`main` にはマージせず**、凍結ブランチからローカル Mac で `deploy:freeze` する。マージする場合は、サイトマップ SSR の復活と `open-next.config.ts` の設定ファイル分離を先に行う。

## 復旧手順
1. ConoHa の修正適用を確認し、WordPress を再開する。
2. `main` をデプロイし直して元の構成（ISR）に戻す。
3. 凍結ブランチは削除せずに残す（再発時に再利用する）。
4. `public/sitemap.xml` / `public/server-sitemap.xml` は `.gitignore` 済みの生成物。

## 残課題
- 実 WP でのビルド・件数照合・デプロイ後確認。
- OGP の画像 URL（凍結中はダミーに差し替えるか）。
- person / company / franchise の `en` ページが本番に存在するか（現状は ja / en の両方を生成）。
- 付随機能（他作品・高スコア・VOD 関連）をビルド時の埋め込みにするか（現状は非表示）。
- `main` へ取り込む場合の設定分離。
