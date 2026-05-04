# KatsumaScore フロントエンド刷新 アーキテクチャ設計書

> **v1.5** ― Archive List Filtering を追記  
> katsumascore.blog ｜ 2026年5月4日

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
| 多言語 | Next.js `i18n`（`ja` / `en`）+ WordPress 記事は **ACF `lang`** で日英を区別（Polylang は使用しない） |
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
  WordPress + WP REST API + ACF Pro
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
| 多言語 | ACF `lang`（`ja` / `en`）を正とし、`normalizePosts` で一覧をフィルタ | REST には互換のため `?lang=` を付与する場合あり（WP 側で無視されうる） |
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

## 5. WordPress Taxonomy（コンテンツ分類）

WordPress リニューアルに伴い、投稿の分類は以下の4 taxonomy で運用する。フロント（Next.js）では locale（`/ja` / `/en`）と REST の `lang` パラメーターで言語を切り替え、表示ラベルは ACF の `name_ja` / `name_en` を正とする。

### 5.1 概要

| taxonomy | 種類 | 件数（整理後） | 備考 |
|---|---|---|---|
| `category` | WP標準 | 3件 | 29件 → 3件にスリム化 |
| `genre` | カスタム（新設） | 18ターム | `post_tag` から移行・新設（一覧は §5.4） |
| `post_tag` | WP標準 | 60件 | 175件 → 60件に整理 |
| `country` | カスタム（新設） | 16カ国 | category サブカテゴリから移行 |

### 5.2 設計思想

**分類ルール**

| taxonomy | 役割 | URL（例） | SEO上の位置づけ |
|---|---|---|---|
| `category` | コンテンツ種別（映画・アニメ・ドラマ） | `/ja/category/{slug}` | 主導線 |
| `genre` | 内容・形式による分類 | `/ja/genre/{slug}` | 主導線 |
| `post_tag` | 視聴体験・感情・特徴 | `/ja/tag/{slug}` | 回遊導線 |
| `country` | 制作国 | `/ja/country/{slug}` | 補助導線 |

**言語設計**

- slug は言語共通（例: `action` / `us`）
- Next.js の locale と REST の `lang` でフィルタリング
- 日英ラベルは ACF Pro の `name_ja` / `name_en` で WordPress 管理

### 5.3 Category

**整理**: 整理前 29件 → 整理後 3件。

| name_ja | name_en | slug | 件数（参考） |
|---|---|---|---|
| 映画 | Movie | `movie` | 995件 |
| アニメ | Anime | `anime` | 83件 |
| ドラマ | Drama | `drama` | 1件 |

**主な移行・削除**: `Movie`（movie-en）・`映画`（movie-ja）を `movie` に統合、`Anime`（anime-en）を `アニメ`（anime）へマージ後削除。劇場版・OVA・Cinema カテゴリ削除。国サブカテゴリ（16件）は country taxonomy へ移行済みのため削除。count=0 のカテゴリ（動画・ゲーム・舞台・Uncategorized・Drama-en 等）削除。

**ACF（term）**

| フィールド名 | ACFキー | 型 | 必須 |
|---|---|---|---|
| 日本語名 | `field_category_name_ja` | text | ✅ |
| English Name | `field_category_name_en` | text | ✅ |

### 5.4 Genre（新設）

ACF Pro 6.1 以降のカスタムタクソノミーで新設。既存 `post_tag` から genre 相当のタームを移行。`post` / `series` に紐付け。

**注:** `superhero` は genre から tag へ変更。`animation` は category で管理するため genre から除外。

| slug | name_ja | name_en |
|---|---|---|
| `action` | アクション | Action |
| `adventure` | アドベンチャー | Adventure |
| `animation` | アニメーション | Animation |
| `comedy` | コメディ | Comedy |
| `drama` | ドラマ | Drama |
| `fantasy` | ファンタジー | Fantasy |
| `horror` | ホラー | Horror |
| `musical` | ミュージカル | Musical |
| `mystery` | ミステリー | Mystery |
| `neo-noir` | ネオ・ノワール | Neo-Noir |
| `period-drama` | 時代劇 | Period Drama |
| `psychological-thriller` | サイコスリラー | Psychological Thriller |
| `sci-fi` | SF | Sci-Fi |
| `sports` | スポーツ | Sports |
| `spy-action` | スパイアクション | Spy Action |
| `survival` | サバイバル | Survival |
| `thriller` | スリラー | Thriller |
| `zombie` | ゾンビ | Zombie |

**ACF**

| フィールド名 | ACFキー | 型 | 必須 |
|---|---|---|---|
| 日本語名 | `field_genre_name_ja` | text | ✅ |
| English Name | `field_genre_name_en` | text | ✅ |
| Genre（投稿紐付け） | `field_genre_post` | taxonomy（checkbox） | ✅ |

### 5.5 Post Tag

**整理**: 175件 → 60件。genre taxonomy へ17件移行、ja/en 重複統合74件、削除23件、残り60件を維持。

**ACF（term）**

| フィールド名 | ACFキー | 型 | 必須 |
|---|---|---|---|
| 日本語名 | `field_tag_name_ja` | text | ❌ |
| English Name | `field_tag_name_en` | text | ❌ |

60件の slug 一覧は運用リファレンスとして `docs/archive/katsumascore_taxonomy_summary.md` の Post Tag 節を参照する。

### 5.6 Country（新設）

ACF Pro 6.1 以降のカスタムタクソノミー。slug は **ISO 3166-1 alpha-2**。既存 category サブカテゴリから投稿を移行後にサブカテゴリ削除。`post` のみ紐付け（series / franchise は対象外）。

| slug | name_ja | name_en | 件数（参考） |
|---|---|---|---|
| `us` | アメリカ | United States | 196件 |
| `jp` | 日本 | Japan | 30件 |
| `gb` | イギリス | United Kingdom | 6件 |
| `au` | オーストラリア | Australia | 4件 |
| `cn` | 中国 | China | 4件 |
| `es` | スペイン | Spain | 4件 |
| `in` | インド | India | 2件 |
| `de` | ドイツ | Germany | 2件 |
| `kr` | 韓国 | South Korea | 2件 |
| `ca` | カナダ | Canada | 2件 |
| `fr` | フランス | France | 1件 |
| `tw` | 台湾 | Taiwan | 1件 |
| `cz` | チェコ | Czech Republic | 1件 |
| `fi` | フィンランド | Finland | 1件 |
| `se` | スウェーデン | Sweden | 1件 |
| `no` | ノルウェー | Norway | 1件 |

**ACF**

| フィールド名 | ACFキー | 型 | 必須 |
|---|---|---|---|
| 日本語名 | `field_country_name_ja` | text | ✅ |
| English Name | `field_country_name_en` | text | ✅ |
| Country（投稿紐付け） | `field_country_post` | taxonomy（checkbox） | ❌ |

### 5.7 運用ルール

**投稿登録時**

| taxonomy | 必須 | 複数選択 |
|---|---|---|
| `category` | ✅ | ❌（1つ） |
| `genre` | ✅ | ✅（1〜2つ推奨） |
| `post_tag` | ❌ | ✅ |
| `country` | ❌ | ✅（合作映画対応） |

**NG例**: genre と tag の重複登録、「映画」「おすすめ」など曖昧なタグ、country に ISO 以外の slug。

### 5.8 ACF JSON（リポジトリ内の定義ファイル）

| ファイル | 内容 |
|---|---|
| `acf-genre-taxonomy.json` | genre taxonomy 定義 + name_ja/name_en + 投稿紐付け |
| `acf-country-taxonomy.json` | country taxonomy 定義 + name_ja/name_en + 投稿紐付け |
| `acf-category-names.json` | category term の name_ja/name_en |

### 5.9 REST API（例）

```
GET /wp-json/wp/v2/genre           → genre 一覧（acf.name_ja / acf.name_en）
GET /wp-json/wp/v2/country         → country 一覧（acf.name_ja / acf.name_en）
GET /wp-json/wp/v2/posts?genre=action&lang=ja  → ja のアクション映画一覧
GET /wp-json/wp/v2/posts?country=us&lang=ja    → ja のアメリカ映画一覧
```

---

## 6. Archive List Filtering

### 6.1 概要

映画・アニメ・ドラマの一覧ページは `ListTemplate` を共通テンプレートとして使用する。フィルタUIは `ListTemplate` が表示し、実際の絞り込み・URL生成・ページングは `pages/{movie,anime,drama}` 側で行う。

対象ページ:

| 種別 | URL |
|---|---|
| 映画 | `/ja/movie` / `/en/movie` |
| アニメ | `/ja/anime` / `/en/anime` |
| ドラマ | `/ja/drama` / `/en/drama` |

### 6.2 URL設計

フィルタ状態は `state` ではなく URL params を正とする。リンク遷移によりページを再生成し、リロード・共有・ページネーションで同じ状態を再現できるようにする。

| 条件 | URL例 | 備考 |
|---|---|---|
| 評価順 | `/ja/anime` | デフォルト。`filter=score` は付与しない |
| 新着 | `/ja/anime?filter=new` | 投稿公開日降順 |
| 配信中 | `/ja/anime?filter=streaming` | VODありのみ |
| genre | `/ja/anime?genre=sports` | `genre:{slug}` として内部表現 |
| tag | `/ja/anime?tag=award` | `tag:{slug}` として内部表現 |
| 並び替え + genre | `/ja/anime?filter=new&genre=sports` | 並び替えと taxonomy を併用 |
| ページング | `/ja/anime?page=2&genre=sports` | middleware で内部的に `/ja/anime/page/2` へ rewrite |

locale は必ず明示 prefix を付ける。`/anime` は `/ja/anime` へリダイレクトし、`/en/anime` は英語ページとして扱う。

### 6.3 UI構造

`ListTemplate` のフィルタバーは以下の行構成とする。

| 行 | 内容 | 生成元 |
|---|---|---|
| 1行目 | 評価順 / 新着 / 配信中 | `ListTemplate` 固定定義 |
| 2行目 | genre | `filterOptionPosts` の `post.genres` |
| 3行目 | tag | `filterOptionPosts` の `post.tags` |

`ListTemplate` は表示用の `posts` と、フィルタ候補生成用の `filterOptionPosts` を分けて受け取る。これにより、絞り込み後の投稿だけで候補が消えることを防ぐ。

### 6.4 データフロー

一覧ページでは、カテゴリ全体の正規化済み投稿を `allPosts` として取得し、URL params に基づいて絞り込み・並び替え・ページングを行う。

```
WP REST API
  → normalizePosts()
  → allPosts
  → filterPostsByListFilters()
  → paginatePosts()
  → ListTemplate(posts, filterOptionPosts)
```

重要な順序:

1. カテゴリ全体の投稿を正規化する
2. `filter` / `genre` / `tag` の URL params を読む
3. taxonomy で絞り込む
4. `score` / `new` / `streaming` で並び替え・絞り込みする
5. 最後にページングする

現在ページの投稿だけで taxonomy を絞り込むと、`/ja/anime?genre=sports` の1ページ目が1件だけになるなど、件数がページ境界に依存してしまう。そのため必ず `allPosts` を起点にする。

### 6.5 Active状態

active状態は複数持てる。`/ja/anime?genre=sports` では `score` と `genre:sports` の両方が active になる。`/ja/anime?filter=new&genre=sports` では `new` と `genre:sports` が active になる。

### 6.6 正規化データ

UIは WordPress 生データを直接扱わない。`mapWPPostToPost()` で `Post.genres` / `Post.tags` に正規化した後、`ListTemplate` に渡す。

英語ページでは term ACF の `name_en` / `genre_name_en` / `tag_name_en` を優先する。英語名が未設定で、WP term の `name` が日本語の場合は slug 由来の英語寄りラベルへフォールバックする。

---

## 7. VOD在庫API（SSR設計）

### 7.1 概要

Netflix・Amazon Prime・U-NEXTの在庫状況をリアルタイムで確認するAPIをCloudflare Workers上でSSR提供する。既存Python scraper（Cloud Run）で収集したデータをCloudflare KVに保存し、フロントからSSRで取得する構成。

### 7.2 エンドポイント

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

### 7.3 データフロー

1. Cloud Scheduler（週1回）→ Cloud Run（Python scraper）が各VODサービスのURL確認
2. 確認結果をCloudflare KV（またはCloud Storage）に書き込み
3. SSRルート（`/api/vod`）がKVから取得してJSONレスポンス
4. 記事ページ（single）は`getServerSideProps`でVOD在庫をサーバー側で取得しHTMLに埋め込み

---

## 8. 実装ロードマップ

| ステップ | 作業内容 | 優先度 |
|---|---|---|
| 1 | Next.js 15プロジェクト作成（Pages Router） | 高 |
| 2 | @opennextjs/cloudflare + wrangler.jsonc設定 | 高 |
| 3 | WP REST API型定義・データ取得層（lib/wordpress.ts） | 高 |
| 4 | WordPressテーマのページ構成をNext.jsルートに移植 | 高 |
| 5 | ACFフィールド（review_score・streaming_vod_* 等）のマッピング | 高 |
| 6 | Storybookの既存コンポーネントをReactに移植（SCSSのみ） | 高 |
| 7 | 多言語（Next.js `i18n` + ACF `lang` による記事の言語切り分け） | 中 |
| 8 | VOD在庫APIのSSRルート実装（/api/vod） | 中 |
| 9 | katsumascore.blogドメインをCloudflare Workersに切り替え | 高 |
| 10 | GitHub Actions CI/CD設定（wrangler deploy） | 中 |
| 11 | Cloudflare Cache Rules設定（管理画面バイパス） | 高 |

---

## 9. 代替案（Workers値上げ・無料枠超過時）

Cloudflare Workersの料金体系変更または無料枠（10万リクエスト/日）超過が発生した場合の構成。コードの大幅変更は不要で、設定変更とGitHub Actionsのデプロイ先変更のみで対応できる。

### 9.1 代替構成

```
[ ConoHa Wing ]
  admin.katsumascore.blog  WordPress（管理画面）
  katsumascore.blog        Next.js 静的HTML（フロント）

[ Cloudflare Workers Free（独立Worker）]
  api.katsumascore.blog    VOD在庫API のみ継続
```

### 9.2 切り替え手順

1. `next.config.ts` に `output: 'export'` を追加（1行のみ）
2. GitHub Actionsのデプロイ先をCloudflare WorkersからConoHa Wing（rsync）に変更
3. ビルドスケジュールを1日2回（毎朝10時・毎夕16時）に設定
4. VOD APIのみ独立したCloudflare Workers Freeに切り出し

> 💡 フロントのコード（ページ・コンポーネント）は一切変更不要。設定ファイルのみの変更で切り替え完了。

> ⚠️ `output: 'export'` に切り替えるとSSRは使えなくなる。VOD APIは独立Workerに分離することで機能を維持できる。

---

## 10. 注意事項・既知の制約

### 10.1 Next.js on Cloudflare Workersの制約

- Node.js APIの一部（`fs`・`child_process`等）はWorkersランタイムで動作しない
- Workers Freeプランのバンドルサイズ上限は3MiB（Paidは10MiB）
- fetch cacheの2MB制限あり（`no-store`は別エラーになるため設定注意）

### 10.2 Pages Router採用理由

- App RouterのRSC・`use client`/`use server`・Server Actionsの複雑さを回避
- `unstable_cache` / `cache()` などの不安定なAPIを避ける
- Pages RouterはOpenNextのCloudflareアダプターでの動作実績が豊富

### 10.3 ACFフィールドのREST API公開設定

ACF Proの各フィールドをWP REST APIで取得するには、WordPressの`functions.php`で明示的に公開設定が必要。

```php
add_filter('acf/rest_api/post/get_fields', '__return_true');
```

---

---

## 11. Search System

### 11.1 概要

検索は2つの入口を持つ。ヘッダーのインクリメンタル検索（ドロップダウン）と、`/search?q=` の検索結果ページ。

| 入口 | コンポーネント | データソース |
|---|---|---|
| ヘッダー検索 | `features/Search` | モックデータ（WP API接続は TODO） |
| 検索結果ページ | `pages/search.tsx` + `SearchResultTemplate` | `/api/search`（API Route）経由でWP REST API |

### 11.2 ファイル構成

```
src/
├── pages/
│   ├── search.tsx                        ← 検索結果ページ（CSR）
│   └── api/
│       └── search.ts                     ← API Route（WP REST APIへのプロキシ）
│
├── components/
│   ├── features/
│   │   ├── Search/                       ← ヘッダー用インクリメンタル検索
│   │   │   ├── Search.tsx                  UI + キーボード操作（aria combobox）
│   │   │   ├── useSearch.ts                状態管理・デバウンス（現在モック）
│   │   │   └── index.ts
│   │   └── SearchBox/                    ← サイドバー用キーワード入力 → /search へ遷移
│   │       ├── SearchBox.tsx
│   │       ├── i18n.ts
│   │       └── index.ts
│   │
│   ├── templates/
│   │   └── SearchResultTemplate/         ← 検索結果ページの画面構造
│   │       ├── SearchResultTemplate.tsx
│   │       └── SearchResultTemplate.types.ts
│   │
│   └── ui-parts/
│       ├── SearchResultItem/             ← ヘッダードロップダウンの1件分
│       └── HighlightText/               ← キーワードハイライト（dangerouslySetInnerHTML不使用）
│
├── libs/
│   └── searchRelevance.ts               ← スコアリング・次元フィルタ・並び替え
│
├── i18n/
│   └── searchPageMessages.ts            ← 検索ページのi18nメッセージ
│
└── types/
    └── search.ts                        ← SearchResult型（ヘッダー検索用）
```

### 11.3 データフロー

**検索結果ページ（`/search?q=xxx`）**

```
ブラウザ（search.tsx）
  → GET /api/search?q=xxx&lang=ja     ← 同一オリジン（CORSなし）
      └── API Route（api/search.ts）
            → GET WP_API_URL/posts?search=xxx&lang=ja&_embed&acf_format=standard
                  ← WordPress REST API（katsumascore.blog）
  ← raw WP JSON[]
  → prepareSearchResults()             ← スコアリング・フィルタ・並び替え
  → mapWPPostToPost()                  ← 正規化
  → SearchResultTemplate に渡す
```

**ヘッダー検索（インクリメンタル）**

```
ユーザー入力（300ms デバウンス）
  → useSearch → searchMock()          ← 現在モックデータ
  → Search.tsx がドロップダウン表示
  → 選択 → onNavigate(href) で遷移
```

> `WP_API_URL` はサーバー専用環境変数のため、CSR（ブラウザ）から直接参照できない。
> API Route をプロキシとして挟むことでCORSを回避し、サーバー側で `WP_API_URL` を使う。

### 11.4 スコアリング（`searchRelevance.ts`）

| フィールド | スコア |
|---|---|
| タイトル一致（WP `title`） | +10 |
| 出演者一致（actors_filed） | +5 |
| 監督一致（taxonomy: director） | +4 |
| ジャンル一致（taxonomy: genre） | +3 |

スコアが同点の場合はタイトルの五十音順でソート。

### 11.5 次元フィルタ

検索結果ページのフィルターバーで絞り込める。

| フィルタ値 | 表示 | 条件 |
|---|---|---|
| `all` | すべて | 制限なし |
| `actor` | 出演者 | actor マッチを含む結果のみ |
| `director` | 監督 | director マッチを含む結果のみ |
| `genre` | ジャンル | genre マッチを含む結果のみ |

### 11.6 HighlightText

`dangerouslySetInnerHTML` + DOMPurify を使わず、`text.split(regex)` でパーツに分割してReactで `<mark>` を返す方式を採用。XSSリスクなし。

### 11.7 今後の対応（TODO）

| 項目 | 内容 |
|---|---|
| ヘッダー検索のWP API接続 | `useSearch` のモックを `/api/search` に差し替える |
| WordPress側の検索拡張 | ACFフィールド（actor / director）を `posts_search` フィルタで検索対象に追加 |
| ページネーション | 検索結果ページに件数表示・ページ送りを追加 |

---

*KatsumaScore フロントエンド刷新 アーキテクチャ設計書 v1.5 ｜ katsumascore.blog ｜ 2026年5月4日*
