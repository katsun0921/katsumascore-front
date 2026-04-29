# KatsumaScore フロントエンド刷新 アーキテクチャ設計書

> **v1.2** ― レンダリング方式ルールを追加  
> katsumascore.blog ｜ 2026年4月29日

---

## 1. 背景と課題

Cloudflare導入後、WordPress管理画面（wp-admin）のセッションが維持できなくなる問題が発生。CloudflareがWordPressの認証Cookie（`wordpress_logged_in_*`）をキャッシュ、またはセッション維持に必要なCookieをストリップすることが原因と判明。

この問題を根本解決するため、WordPressの管理画面とフロントエンドを完全に分離するヘッドレス構成への移行を決定した。

### 1.1 既存環境

| 項目 | 内容 |
|------|------|
| ブログ名 | KatsumaScore（katsumascore.blog） |
| WordPress管理画面 | ConoHa Wing（共有レンタルサーバー） |
| DNS・CDN | Cloudflare |
| コンテンツ管理 | WordPress REST API（wp-json）+ ACF Pro |
| 多言語 | Polylang Pro（日本語/英語） |
| フロントエンド | WordPressカスタムテーマ（PHP）→ 移行対象 |
| コンポーネント管理 | Storybook（React） |
| VOD在庫チェック | Google Sheets + Apps Script + Cloud Run（Python scraper） |

### 1.2 移行の決定事項

- 管理画面（`admin.katsumascore.blog`）はConoHa Wing上のWordPressのまま維持
- フロントエンド（`katsumascore.blog`）はNext.jsで構築し、WP REST APIからデータを取得して表示
- VOD在庫APIはSSRで提供するため、Cloudflare Workersを採用

---

## 2. フレームワーク・ホスティング選定

### 2.1 フレームワーク選定

| フレームワーク | 判定 | 理由 |
|---|---|---|
| Next.js 15（Pages Router） | ✅ 採用 | React資産・Storybook活用・Workers移行パスあり |
| Remix | ❌ 除外 | 静的エクスポート非対応・Node.jsサーバー必須 |
| Astro 6 | ❌ 除外 | ISRネイティブ非対応・React資産の活用が制限される |
| SvelteKit 2 | ❌ 除外 | Reactではない・既存Storybook資産が活かせない |
| Nuxt 4 | ❌ 除外 | Vue系・Reactコンポーネント資産が活かせない |

> 💡 App Routerは採用しない。RSC・`use client`/`use server`・`unstable_cache`などの複雑さを避け、Pages Routerで実装する。

### 2.2 ホスティング選定

| 選択肢 | 判定 | 理由 |
|---|---|---|
| Cloudflare Workers | ✅ 採用（本線） | VOD API SSR対応・Pages移行先・OpenNextで対応 |
| Cloudflare Pages | ✅ 経由（初期） | Workers Buildsへの移行推奨。初期デプロイはPages経由も可 |
| Vercel Pro | ❌ 除外 | 未契約・Hobbyは非商用のみ |
| ConoHa Wing 静的 | 🔄 代替案 | Workers値上げ・無料枠超過時のフォールバック |
| ConoHa VPS | ❌ 除外 | 追加費用・管理コスト増 |

---

## 3. 最終アーキテクチャ

### 3.1 全体構成

```
[ ConoHa Wing ]
  admin.katsumascore.blog
  WordPress + WP REST API + ACF Pro + Polylang Pro
  Cloudflare Cache Rules: Bypass（管理画面のみ）
         │ wp-json/wp/v2/
         ↓
[ Cloudflare Workers ]
  katsumascore.blog
  Next.js 15（Pages Router）
  + @opennextjs/cloudflare
  + /api/vod  ← VOD在庫API（SSR）
  + /api/revalidate ← Webhook受信
```

### 3.2 技術スタック

| レイヤー | 技術 | 備考 |
|---|---|---|
| フレームワーク | Next.js 15（Pages Router） | App Routerは使用しない |
| Workersアダプター | @opennextjs/cloudflare | OpenNext公式Cloudflareアダプター |
| コンテンツソース | WordPress REST API + ACF | ConoHa Wing上のWordPress |
| 多言語 | Polylang Pro → REST APIで言語パラメーター | `?lang=ja` / `?lang=en` |
| VOD在庫API | SSR（Cloudflare Workers） | Netflix / Amazon Prime / U-NEXT |
| コンポーネント管理 | Storybook（既存流用） | SCSSのみ使用 |
| スタイリング | Tailwind CSS v4（Next.jsページ） / SCSS（Storybook） | 役割で完全分離 |
| HTML描画 | html-react-parser | WP REST APIのHTML出力を安全にReact化 |
| CI/CD | GitHub Actions + Wrangler | pushで自動デプロイ |
| DNS・CDN | Cloudflare | 既存のまま |

### 3.3 Cloudflare Cache Rules設定

| 対象URL | 設定 | 目的 |
|---|---|---|
| `admin.katsumascore.blog/*` | Cache Level: Bypass | 管理画面のセッション維持（根本対処） |
| `katsumascore.blog/wp-json/*` | Cache Level: Bypass | REST APIはキャッシュしない |
| `katsumascore.blog/api/*` | Cache Level: Bypass | VOD API等の動的ルートはバイパス |
| `katsumascore.blog/*` | Workers経由でキャッシュ制御 | フロントは高速配信 |

---

## 4. レンダリング方式

### 4.1 ページ種別ごとの方式

| ページ種別 | レンダリング方式 | Pages Router実装 |
|-----------|----------------|-----------------|
| 固定ページ | SSG | `getStaticProps` |
| LP / 特集 | SSG | `getStaticProps` |
| 記事 | ISR | `getStaticProps` + `revalidate` |
| TOP | ISR + 動的取得 | `getStaticProps` + `revalidate` + client-side fetch |
| VOD | SSR | `getServerSideProps` |

### 4.2 適用ルール

- ページファイルの先頭コメントに方式を明記する（例: `// Rendering: ISR`）
- ISRの `revalidate` デフォルトは **60秒**。ページ要件に応じて調整する
- SSGページで動的データが必要な場合は client-side fetch（SWR）を使う
- SSRは VODページのみに限定する。パフォーマンス上の理由から他ページへの拡大を禁止する

---

## 5. VOD在庫API（SSR設計）

### 4.1 概要

Netflix・Amazon Prime・U-NEXTの在庫状況をリアルタイムで確認するAPIをCloudflare Workers上でSSR提供する。既存Python scraper（Cloud Run）で収集したデータをCloudflare KVに保存し、フロントからSSRで取得する構成。

### 4.2 エンドポイント

```
GET /api/vod?slug={post-slug}
```

| フィールド | 型 | 説明 |
|---|---|---|
| `netflix` | boolean | Netflix配信中かどうか |
| `amazon` | boolean | Amazon Prime配信中かどうか |
| `unext` | boolean | U-NEXT配信中かどうか |
| `is_cinema` | boolean | 劇場公開中（VOD非表示フラグ） |
| `updated_at` | string（ISO8601） | 最終確認日時（Cloud Runが更新） |

### 4.3 データフロー

1. Cloud Scheduler（週1回）→ Cloud Run（Python scraper）が各VODサービスのURL確認
2. 確認結果をCloudflare KV（またはCloud Storage）に書き込み
3. SSRルート（`/api/vod`）がKVから取得してJSONレスポンス
4. 記事ページ（single）は`getServerSideProps`でVOD在庫をサーバー側で取得しHTMLに埋め込み

---

## 6. 実装ロードマップ

| ステップ | 作業内容 | 優先度 |
|---|---|---|
| 1 | Next.js 15プロジェクト作成（Pages Router） | 高 |
| 2 | @opennextjs/cloudflare + wrangler.jsonc設定 | 高 |
| 3 | WP REST API型定義・データ取得層（lib/wordpress.ts） | 高 |
| 4 | WordPressテーマのページ構成をNext.jsルートに移植 | 高 |
| 5 | ACFフィールド（review_score・title_jp/en・streaming_vod_*）のマッピング | 高 |
| 6 | Storybookの既存コンポーネントをReactに移植（SCSSのみ） | 高 |
| 7 | Polylang多言語対応（/ja/・/en/ ルーティング） | 中 |
| 8 | VOD在庫APIのSSRルート実装（/api/vod） | 中 |
| 9 | katsumascore.blogドメインをCloudflare Workersに切り替え | 高 |
| 10 | GitHub Actions CI/CD設定（wrangler deploy） | 中 |
| 11 | Cloudflare Cache Rules設定（管理画面バイパス） | 高 |

---

## 7. 代替案（Workers値上げ・無料枠超過時）

Cloudflare Workersの料金体系変更または無料枠（10万リクエスト/日）超過が発生した場合の構成。コードの大幅変更は不要で、設定変更とGitHub Actionsのデプロイ先変更のみで対応できる。

### 6.1 代替構成

```
[ ConoHa Wing ]
  admin.katsumascore.blog  WordPress（管理画面）
  katsumascore.blog        Next.js 静的HTML（フロント）

[ Cloudflare Workers Free（独立Worker）]
  api.katsumascore.blog    VOD在庫API のみ継続
```

### 6.2 切り替え手順

1. `next.config.ts` に `output: 'export'` を追加（1行のみ）
2. GitHub Actionsのデプロイ先をCloudflare WorkersからConoHa Wing（rsync）に変更
3. ビルドスケジュールを1日2回（毎朝10時・毎夕16時）に設定
4. VOD APIのみ独立したCloudflare Workers Freeに切り出し

> 💡 フロントのコード（ページ・コンポーネント）は一切変更不要。設定ファイルのみの変更で切り替え完了。

> ⚠️ `output: 'export'` に切り替えるとSSRは使えなくなる。VOD APIは独立Workerに分離することで機能を維持できる。

---

## 8. 注意事項・既知の制約

### 8.1 Next.js on Cloudflare Workersの制約

- Node.js APIの一部（`fs`・`child_process`等）はWorkersランタイムで動作しない
- Workers Freeプランのバンドルサイズ上限は3MiB（Paidは10MiB）
- fetch cacheの2MB制限あり（`no-store`は別エラーになるため設定注意）

### 8.2 Pages Router採用理由

- App RouterのRSC・`use client`/`use server`・Server Actionsの複雑さを回避
- `unstable_cache` / `cache()` などの不安定なAPIを避ける
- Pages RouterはOpenNextのCloudflareアダプターでの動作実績が豊富

### 8.3 ACFフィールドのREST API公開設定

ACF Proの各フィールドをWP REST APIで取得するには、WordPressの`functions.php`で明示的に公開設定が必要。

```php
add_filter('acf/rest_api/post/get_fields', '__return_true');
```

---

*KatsumaScore フロントエンド刷新 アーキテクチャ設計書 v1.2 ｜ katsumascore.blog ｜ 2026年4月29日*
