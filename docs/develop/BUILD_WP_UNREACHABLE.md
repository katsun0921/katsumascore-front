# ビルド環境から WordPress へ到達できない問題

> 状態: **暫定対応済み・根本対応は未着手**
> 2026-08-10

GitHub Actions のビルドから WordPress REST API へアクセスすると **HTTP 403** が返る。
そのため一覧ページの多くがビルド時にデータを取得できていない。

---

## 症状

### 1. ビルドログに現れる失敗

デプロイの成否にかかわらず、**毎回**以下が出力されている。

```
[generate-genres] フェッチ失敗: HTTP 403 — 空配列を書き出します
[getStaticPaths] WP から記事スラッグを取得できず、事前生成をスキップする  ×3
```

### 2. 本番で発生した実害

| 事象 | 原因 |
|---|---|
| `/ja/movie` `/ja/anime` `/ja/drama` が404 | 取得失敗を `notFound: true` で返し、静的出力に404が焼き付いた |
| 記事詳細が事前生成されない | `getStaticPaths` が0件を返す（`fallback: 'blocking'` のため表示自体は可能） |
| ジャンルの静的生成が空 | `generate-genres` が空配列を書き出す |

### 3. 対応を誤ると起きること

取得失敗時に `throw` するとビルド全体が失敗する（2026-08-10 に発生）。
**WP へ到達できない状態が常態化しているため、`throw` はデプロイ不能を意味する。**

```
Error: [anime] WP から記事一覧を取得できなかったためビルドを中止する
Export encountered an error on /anime: /default/anime, exiting the build.
```

---

## 原因

**ConoHa WING の WAF が GitHub Actions ランナーの IP を拒否していると考えられる。**

検証結果:

| 実行元 | 結果 |
|---|---|
| ローカル（家庭用回線） | ✅ 200（20回連続でも全て200。レート制限なし） |
| GitHub Actions ランナー | ❌ 403 |

- `WP_API_URL` はビルドログ上で `***`（マスク済み）として渡っており、**環境変数の設定漏れではない**
- User-Agent を変えても（`node` / 空文字）ローカルからは 200 のため、UA 判定ではない
- 403 は認証・拒否系のため**リトライしても解決しない**（`shouldRetryStatus` も 403 を再試行対象外にしている）
- 同一ビルド内で `/ja/vod/netflix` 等は事前生成できており、**全てのリクエストが失敗するわけではない**（断続的、あるいはエンドポイント単位の差がある可能性）

> ConoHa WING の WAF が `?author=` や `/wp-json/jwt-auth/` をブロックする件は
> ルート `CLAUDE.md` に既知事項として記載がある。今回も同系統の可能性が高い。

---

## 暫定対応（実施済み）

**WP 取得失敗時は 404 を焼き付けず、ビルドも止めない。**

- `loadCategoryListPage` は取得失敗を `fetchFailed` として返す（`notFound` と区別する）
- カテゴリ一覧（`/movie` `/anime` `/drama`）は `buildEmptyCategoryListPage` で
  **空一覧のページを `revalidate: 60` で生成**する。リクエスト時の ISR 再生成で実データへ復旧する
- ページング（`/page/[page]`）・`/actor/[slug]` は `fallback: 'blocking'` のため
  短い `revalidate` の 404 を返す（リクエスト時に再生成される）

### 暫定対応の限界

- **デプロイ直後の一瞬は一覧が空で表示される**（ISR 再生成までの間）
- 事前生成されないため初回アクセスが遅い
- `generate-genres` は空配列のままで、ジャンルの静的データが欠けている

根本対応が入るまで、この状態が続く。

---

## 根本対応（未着手・要 WP 側作業）

**WordPress 側で GitHub Actions からのアクセスを許可する。**

`katsumascore_wordpress_theme` リポジトリまたは ConoHa WING の管理画面での作業が必要。

### 方針の候補

1. **WAF の除外設定**
   ConoHa WING のコントロールパネルで、`/wp-json/wp/v2/` へのアクセスを WAF 除外に追加する。
   `.htaccess` で Basic 認証を `/wp-json/` から除外している前例がある（ルート `CLAUDE.md` 参照）。

2. **GitHub Actions の IP レンジを許可**
   `https://api.github.com/meta` の `actions` に IP レンジが公開されている。
   ただしレンジは広く変動もあるため、運用負荷は高い。

3. **共有シークレットによる許可**
   ビルド時のリクエストにヘッダー（例: `X-Build-Token`）を付け、
   WP 側でそのヘッダーがあれば WAF/制限を通す。IP に依存しないため安定する。
   `vod_scraping_api` が Cloud Run から同じ API を叩けている実績があるため、
   同様の仕組みが使えるか確認する価値がある。

### 確認方法

対応後、デプロイのビルドログに以下が**出なくなる**ことを確認する。

```
[generate-genres] フェッチ失敗: HTTP 403
[getStaticPaths] WP から記事スラッグを取得できず、事前生成をスキップする
```

あわせて、ビルド出力に `/ja/movie` `/ja/anime` `/ja/drama` が
プリレンダ対象として現れることを確認する（現在は現れない）。

---

## 関連

- 暫定対応の実装: `src/libs/loadCategoryListPage.ts`（`fetchFailed` / `buildEmptyCategoryListPage`）
- 失敗したデプロイ: https://github.com/katsun0921/katsumascore-front/actions/runs/31387735754
- WP 認証・WAF の既知事項: ルート `CLAUDE.md`「WordPress 認証（全プロジェクト共通）」
