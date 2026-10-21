# 画像問題（2026-10-21）

## 問題
画像は WP の `/wp-content/uploads/` にあり、フロントは次の 2 経路で参照している。
1. `next/image`（13 コンポーネント）。本番では Next の画像最適化が **Worker から実行時に WP へ取得**する（`images.unoptimized` は開発時のみ true）。
2. 記事本文 HTML の `<img>` / `<source>`、インライン style の `url(...)`。ブラウザが WP へ直接取得する。

WP を `.htaccess` で止めても uploads だけ許可する案はあったが、その場合も画像は Worker 経由で WP に届く。

## 判断
1. 最初の提案: 「ページ表示で WP へリクエストしない」の**例外**として画像を扱うか、最適化を切るかを確認した。
2. 回答: **WP へのリクエストに例外は含めない。一時的な画像の非表示は許容する。**
3. 非表示にするとレイアウトが崩れた。→ **ダミー画像で対応する**ことにした。

## 実装
凍結ビルド（`NEXT_PUBLIC_SSG_FREEZE=1`）のときだけ、`/wp-content/` を含む画像をダミー画像 `public/images/freeze-dummy.svg` に差し替える。寸法・class は維持してレイアウトを保つ。

| 対象 | 方法 |
|---|---|
| `next/image` 全般 | `next.config.ts` の webpack alias で `next/image` を `src/libs/freeze/FreezeImage.tsx` に差し替え。WP 画像の src ならダミーを `unoptimized` で描画。それ以外は本物の `next/image` |
| 本文 HTML の `<img>` | `replaceWpImagesInHtml`: src をダミーにし、srcset / data-src / sizes を除去。width・height・class・alt は維持 |
| 本文 HTML の `<source>` | 削除（`<picture>` は `<img>` にフォールバック） |
| インライン style | `url(.../wp-content/...)` をダミーにする |

適用箇所: `PostContent` / `VodIntroduction`、および alias による全コンポーネント。

## 対象外（そのまま表示される）
- `public/` 配下の画像（ロゴ等）。
- 他ホストの画像（TMDB 等）。

## 残る WP 画像参照（既知）
- **OGP・JSON-LD の画像 URL** は文字列として HTML に残る。ページ表示時には取得されないが、SNS クローラーが取得しに来る場合、WP 停止中は失敗する（シェア時のサムネイルが出ないだけ）。必要なら凍結中は OGP もダミーに差し替える（未実施）。

## 検証
- 確認済み: 差し替え処理のスクリプト検証（WP 画像→ダミー、ローカル・他ホスト→そのまま、本文 HTML の置換）。webpack alias が実ビルドで有効なこと（一時的に例外を仕込んで確認）。型チェック・lint・モック凍結ビルド成功。
- 未確認: モックデータに画像 URL が無いため、実ページのレイアウト目視と、生成物に WP 画像が残っていないかの確認。実 WP でのビルド後に次を実行する。
  ```
  grep -rl "wp-content" .open-next/cache
  ```
  ヒットしたファイルの中身が OGP・JSON-LD の文字列だけであることを確かめる。

## 復旧
`main` を再デプロイすれば画像は元に戻る。
