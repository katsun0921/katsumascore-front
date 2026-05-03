# KatsumaScore Taxonomy 整理まとめ

> **アーカイブ（2026年5月1日）** — 要約は `docs/ARCHITECTURE.md` の「5. WordPress Taxonomy（コンテンツ分類）」を参照。本ファイルは Post Tag 全60件の slug 一覧などフルリスト用。

> WordPress リニューアル対応  
> katsumascore.blog ｜ 2026年4月

---

## 1. 概要

WordPressリニューアルに伴い、以下の4つのtaxonomyを整理・新設した。

| taxonomy | 種類 | 件数 | 対応 |
|---|---|---|---|
| `category` | WP標準 | 3件 | 29件 → 3件にスリム化 |
| `genre` | カスタム（新設） | 19種 | post_tagから移行・新設 |
| `post_tag` | WP標準 | 60件 | 175件 → 60件に整理 |
| `country` | カスタム（新設） | 16カ国 | categoryサブカテゴリから移行 |

---

## 2. 設計思想

### 分類ルール

| taxonomy | 役割 | URL | SEO |
|---|---|---|---|
| `category` | コンテンツ種別（映画・アニメ・ドラマ） | `/ja/category/{slug}` | 主導線 |
| `genre` | 内容・形式による分類 | `/ja/genre/{slug}` | 主導線 |
| `post_tag` | 視聴体験・感情・特徴 | `/ja/tag/{slug}` | 回遊導線 |
| `country` | 制作国 | `/ja/country/{slug}` | 補助導線 |

### 言語設計

- slug は言語共通（`action` / `us` 等）
- Next.js の locale（`/ja` / `/en`）でフィルタリング
- 日英ラベルはACF Pro の `name_ja` / `name_en` フィールドでWP管理

---

## 3. Category

### 整理前後

| 変更 | 件数 |
|---|---|
| 整理前 | 29件 |
| 整理後 | 3件 |

### 確定カテゴリ

| name_ja | name_en | slug | 件数 |
|---|---|---|---|
| 映画 | Movie | `movie` | 995件 |
| アニメ | Anime | `anime` | 83件 |
| ドラマ | Drama | `drama` | 1件 |

### 実施内容

- `Movie`（movie-en）・`映画`（movie-ja）→ `movie` に統合
- `Anime`（anime-en）33件 → `アニメ`（anime）にmerge後削除
- 劇場版・OVA・Cinema → 削除
- 国サブカテゴリ（16件）→ country taxonomyに移行済みのため削除
- count=0カテゴリ（動画・ゲーム・舞台・Uncategorized・Drama-en）→ 削除

### ACFフィールド

| フィールド名 | ACFキー | 型 | 必須 |
|---|---|---|---|
| 日本語名 | `field_category_name_ja` | text | ✅ |
| English Name | `field_category_name_en` | text | ✅ |

---

## 4. Genre（新設）

### 設計

- ACF Pro 6.1以降のカスタムタクソノミー機能で新設
- 既存の `post_tag` からgenre相当のタームを移行
- `post` / `series` に紐付け

### genre一覧（19種）

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

> ⚠️ `superhero` はgenreからtagに変更。`animation` はcategoryで管理するためgenreから除外。

### ACFフィールド

| フィールド名 | ACFキー | 型 | 必須 |
|---|---|---|---|
| 日本語名 | `field_genre_name_ja` | text | ✅ |
| English Name | `field_genre_name_en` | text | ✅ |
| Genre（投稿紐付け） | `field_genre_post` | taxonomy（checkbox） | ✅ |

---

## 5. Post Tag

### 整理前後

| 変更 | 件数 |
|---|---|
| 整理前 | 175件 |
| 整理後 | 60件 |

### 整理内容

| 処理 | 件数 |
|---|---|
| genre taxonomy に移行 | 17件 |
| ja/en重複を統合 | 74件 |
| 削除（特定作品名・count=0等） | 23件 |
| 維持 | 60件 |

### tag一覧（60件）

| slug | 内容 |
|---|---|
| `academy-award` | アカデミー賞受賞作品 |
| `arthouse` | アートハウスシネマ |
| `b-movie` | B級映画 |
| `ballet` | バレエ |
| `based-on-game` | ゲーム原作 |
| `biography` | 伝記 |
| `boy-meets-girl` | ボーイミーツガール |
| `buddy` | 相棒・バディ |
| `cant-sleep` | 観たら眠れなくなる |
| `car-race` | カーレース |
| `closed-space` | 密室 |
| `comic-adaptation` | 漫画原作 |
| `coming-of-age` | 成長物語 |
| `cyberpunk` | サイバーパンク |
| `death-game` | デスゲーム |
| `dinosaur` | 恐竜 |
| `diving` | ダイビング |
| `end-of-life` | 人生の終わり |
| `ensemble` | 群像劇 |
| `family` | 家族 |
| `fantasy` | ファンタジー |
| `friendship` | 友情 |
| `gender` | ジェンダー |
| `greek-mythology` | ギリシャ神話 |
| `history` | 歴史 |
| `human-drama` | ヒューマンドラマ |
| `humans-and-ai` | 人類とAI |
| `hunting-monsters` | 怪物狩り |
| `live-action-anime` | アニメ実写化 |
| `live-action-disney` | ディズニー実写化 |
| `live-scene` | ライブシーン |
| `love-romance` | ラブロマンス |
| `mars` | 火星 |
| `medieval-fantasy` | 中世ファンタジー |
| `medieval-japan` | 中世日本 |
| `meta-film` | 映画を撮る映画 |
| `motherhood` | 母親の愛情 |
| `netflix-original` | Netflixオリジナル |
| `nonstop` | ノンストップ |
| `outlaw` | アウトロー |
| `performing-arts` | 芸道 |
| `pixar` | ピクサー |
| `post-apocalypse` | 文明崩壊後の世界 |
| `pov` | POV |
| `scary-man` | 怒らせたら怖いおじさん |
| `sharks` | サメ |
| `sky-action` | 空中アクション |
| `social-satire` | 社会風刺 |
| `space` | 宇宙 |
| `strong-woman` | 戦う女性 |
| `submarine` | 潜水艦 |
| `superhero` | スーパーヒーロー |
| `teenagers` | 10代が主人公 |
| `time-leap` | タイムリープ |
| `timelimit` | タイムリミット |
| `undercover` | 潜入捜査 |
| `vampire` | ヴァンパイア |
| `virtual-world` | 仮想世界 |
| `virus-pandemic` | ウィルスパンデミック |
| `wwii` | 第二次世界大戦 |
| `young-adult` | ヤングアダルト |

### ACFフィールド

| フィールド名 | ACFキー | 型 | 必須 |
|---|---|---|---|
| 日本語名 | `field_tag_name_ja` | text | ❌ |
| English Name | `field_tag_name_en` | text | ❌ |

---

## 6. Country（新設）

### 設計

- ACF Pro 6.1以降のカスタムタクソノミー機能で新設
- slug：ISO 3166-1 alpha-2
- 既存categoryサブカテゴリから投稿を移行後削除
- `post` のみに紐付け（series / franchiseは対象外）

### country一覧（16カ国）

| slug | name_ja | name_en | 件数 |
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

### ACFフィールド

| フィールド名 | ACFキー | 型 | 必須 |
|---|---|---|---|
| 日本語名 | `field_country_name_ja` | text | ✅ |
| English Name | `field_country_name_en` | text | ✅ |
| Country（投稿紐付け） | `field_country_post` | taxonomy（checkbox） | ❌ |

---

## 7. 運用ルール

### 投稿登録時

| taxonomy | 必須 | 複数選択 |
|---|---|---|
| `category` | ✅ | ❌（1つ） |
| `genre` | ✅ | ✅（1〜2つ推奨） |
| `post_tag` | ❌ | ✅ |
| `country` | ❌ | ✅（合作映画対応） |

### NG

- genreとtagの重複登録
- 「映画」「おすすめ」などの曖昧タグ
- countryにISO以外のslugを使用

---

## 8. ACF JSONファイル一覧

| ファイル | 内容 |
|---|---|
| `acf-genre-taxonomy.json` | genre taxonomy定義 + name_ja/name_en + 投稿紐付け |
| `acf-country-taxonomy.json` | country taxonomy定義 + name_ja/name_en + 投稿紐付け |
| `acf-category-names.json` | category term の name_ja/name_en |

---

## 9. REST API

```
GET /wp-json/wp/v2/genre          → genre一覧（acf.name_ja / acf.name_en）
GET /wp-json/wp/v2/country        → country一覧（acf.name_ja / acf.name_en）
GET /wp-json/wp/v2/posts?genre=action&lang=ja  → jaのアクション映画一覧
GET /wp-json/wp/v2/posts?country=us&lang=ja    → jaのアメリカ映画一覧
```

---

*KatsumaScore Taxonomy 整理まとめ ｜ katsumascore.blog ｜ 2026年4月*
