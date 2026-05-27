# （アーカイブ）KatsumaScore ACF フィールド設計まとめ

> **正規の集約先:** [`../features/ARCHITECTURE.md`](../features/ARCHITECTURE.md) の **§5 WordPress ACF・CMSデータモデル** および **§6 WordPress Taxonomy**。以下は移行前のスナップショットとして保持する。  
> WordPress リニューアル対応 ｜ katsumascore.blog ｜ 2026年4月

---

## 1. フィールドグループ一覧

| グループ名 | key | 対象 | 用途 |
|---|---|---|---|
| Common Fields | `group_common_fields` | post / page / series | 言語・description共通フィールド |
| 基本情報 | `group_61201fa8a105c` | post | レビュー基本情報 |
| 記事内容の共通項目 | `group_63e5c9ae2b6a9` | post | おすすめポイント・あらすじ・タグ等 |
| Genre | `group_post_genre` | post / series | genreタクソノミー紐付け |
| Genre Names | `group_genre_names` | genre taxonomy | genre日英名管理 |
| Country | `group_post_country` | post | countryタクソノミー紐付け |
| Country Names | `group_country_names` | country taxonomy | country日英名管理 |
| Category Names | `group_category_names` | category taxonomy | category日英名管理 |
| Tag Names | `group_tag_names` | post_tag taxonomy | tag日英名管理 |
| レビューサイト | `group_61207dbc9f029` | post | 外部レビューサイトURL |
| コンテンツを配信しているVOD | `group_63f8503a182b9` | post | VOD配信情報 |
| コンテンツをレンタルしているサービス | `group_63fb01ac9d488` | post | レンタルURL |
| 商品ブロック | `group_product_block` | post | 商品ブロック |
| Page Display Control | `group_page_display_control` | page | ページ表示設定 |

---

## 2. Common Fields

全投稿タイプ（post / page / series）共通のフィールドグループ。

| フィールド名 | name | key | 型 | 必須 | 備考 |
|---|---|---|---|---|---|
| 言語 | `lang` | `field_69f0c1f525649` | radio | ✅ | `ja` / `en`・デフォルト`ja` |
| Description | `description` | `field_description` | textarea | ❌ | 最大160文字・aioseo_description代替 |

### lang

- 値：`ja`（日本語）/ `en`（English）
- デフォルト：`ja`
- 既存データ：502件（`基本情報` グループから移行）
- Next.js側でlocaleフィルタリングに使用

```
/ja → lang = ja の投稿のみ表示
/en → lang = en の投稿のみ表示
```

### description

- aioseo_descriptionを代替するACFフィールド
- `wp_aioseo_posts.description` から514件移行済み
- 推奨文字数：120文字前後（最大160文字）
- REST APIで `/wp-json/wp/v2/posts?lang=ja` で取得可能

---

## 3. 基本情報

post専用のレビュー基本情報フィールドグループ。

| フィールド名 | name | key | 型 |
|---|---|---|---|
| 多言語の紐付け | `translation_post` | `field_69f0c3132564a` | post_object |
| レビュースコア | `review_score` | `field_612020580983a` | number |
| 日本語タイトル | `title_jp` | `field_6120505b43660` | text |
| 英語タイトル | `title_en` | `field_612020910983b` | text |
| コピーライト | `copyright` | `field_63f8586bb8403` | text |
| 監督 | `director` | `field_63db4c604a564` | text |
| 主要な登場人物一覧 | `actors_filed` | `field_63e5c5e2c9edc` | repeater |
| 配給会社 | `film_studio` | `field_63db4cf14a566` | text |
| 制作会社 | `production_studio` | `field_63db4d254a567` | text |
| 公式サイトのURL | `official_url` | `field_612021110983c` | url |
| 公式SNS | `official_sns` | `field_68c58083a98c3` | - |
| Video Code | `video_code` | `field_6120218a0983e` | text |
| 上映劇場 | `cinema_info_filed` | `field_63e6d8a1ec24e` | - |
| 公開年 | `release` | `field_63e63818bef2c` | number |
| 関連するポスト | `relation_fields` | `field_68c656f332fcf` | relationship |
| シリーズ | `type_post_series` | `field_66298ccfca327` | - |
| タグ | `type_post_tag` | `field_6623292666e53` | - |

> ⚠️ `lang` フィールドはリニューアルに伴い `Common Fields` グループに移動済み

---

## 4. Taxonomy関連フィールド

### Genre（group_post_genre）

| フィールド名 | name | key | 型 | 対象 |
|---|---|---|---|---|
| Genre | `genre` | `field_genre_post` | taxonomy（checkbox） | post / series |

### Genre Names（group_genre_names）

| フィールド名 | name | key | 型 | 必須 |
|---|---|---|---|---|
| 日本語名 | `name_ja` | `field_genre_name_ja` | text | ✅ |
| English Name | `name_en` | `field_genre_name_en` | text | ✅ |

### Country（group_post_country）

| フィールド名 | name | key | 型 | 対象 |
|---|---|---|---|---|
| Country | `country` | `field_country_post` | taxonomy（checkbox） | post |

### Country Names（group_country_names）

| フィールド名 | name | key | 型 | 必須 |
|---|---|---|---|---|
| 日本語名 | `name_ja` | `field_country_name_ja` | text | ✅ |
| English Name | `name_en` | `field_country_name_en` | text | ✅ |

### Category Names（group_category_names）

| フィールド名 | name | key | 型 | 必須 |
|---|---|---|---|---|
| 日本語名 | `name_ja` | `field_category_name_ja` | text | ✅ |
| English Name | `name_en` | `field_category_name_en` | text | ✅ |

### Tag Names（group_tag_names）

| フィールド名 | name | key | 型 | 必須 |
|---|---|---|---|---|
| 日本語名 | `name_ja` | `field_tag_name_ja` | text | ❌ |
| English Name | `name_en` | `field_tag_name_en` | text | ❌ |

---

## 5. REST API

```
// 投稿一覧（日本語）
GET /wp-json/wp/v2/posts?lang=ja

// 投稿一覧（英語）
GET /wp-json/wp/v2/posts?lang=en

// genre一覧（name_ja / name_en含む）
GET /wp-json/wp/v2/genre

// country一覧（name_ja / name_en含む）
GET /wp-json/wp/v2/country

// アクション映画（日本語）
GET /wp-json/wp/v2/posts?genre=action&lang=ja

// アメリカ映画（日本語）
GET /wp-json/wp/v2/posts?country=us&lang=ja
```

---

## 6. データ移行まとめ

| フィールド | 移行元 | 移行先 | 件数 |
|---|---|---|---|
| `lang` | `基本情報` グループ | `Common Fields` グループ | 502件 |
| `description` | `wp_aioseo_posts.description` | `wp_postmeta.description` | 514件 |

---

## 7. ACF JSONファイル一覧

| ファイル | 内容 |
|---|---|
| `acf-common-fields-updated.json` | 全フィールドグループ（langをCommon Fieldsに移動済み） |
| `acf-genre-taxonomy.json` | genre taxonomy定義 + name_ja/name_en + 投稿紐付け |
| `acf-country-taxonomy.json` | country taxonomy定義 + name_ja/name_en + 投稿紐付け |
| `acf-category-names.json` | category term の name_ja/name_en |

---

*KatsumaScore ACF フィールド設計まとめ ｜ katsumascore.blog ｜ 2026年4月*
