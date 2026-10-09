# TOP ページ キュレーション枠（Post 一覧 / 関連シリーズ）

> ステータス: WP側実装済み / フロント側未着手
> 作成: 2026-10-09 / 更新: 2026-10-10
> **管理方法は案A（WordPress / ACF オプションページ）で確定。WP側は実装完了。**
>
> WP側の実装と詳細仕様: `katsumascore_wordpress_theme/docs/feature/HOME_CURATED_API_SPEC.md`
> （ブランチ `feature/acf-top-curated`）

## 概要

TOP ページに「編集部が手で選んだ作品群」を出す枠を追加する。枠は 3 種類あるが、**見出しラベル + 説明文 + 項目リスト**という同一構造を共有する。

| `kind` | 中身 | 例 |
|---|---|---|
| `posts` | 手で選んだ記事（Post）の集合 | 「2026年上半期ベスト10」「泣けるアニメ映画」 |
| `series` | `series` CPT の集合 + 各シリーズの作品記事 | 「いま追うべきシリーズ」 |
| `franchise` | `franchise` タクソノミーの集合 + 各シリーズの作品記事 | 「バイオハザードを観る順番」「DUNE を公開順に」 |

想定する使い方は「**新作公開に合わせて既存シリーズを見せる**」である。
バイオハザード新作公開週に既存シリーズ作品を並べる、DUNE 新作の公開時期に
Part1 / Part2 を並べる、といったケース。作品記事は**自動収集**され、
順番を変えたいときだけ手動指定で上書きする。

既存の TOP セクション（最新レビュー・ランキング・注目のアニメ・高評価）は**すべて自動生成**で、スコアや公開日から機械的に並ぶ。本機能はそこに**人の編集意図**を差し込む枠である。

### 戦略上の位置付け

`STRATEGY_2026.md` の 2 本柱のうち「既存資産を結び直す」に直接対応する。

- 新しい外部データ取得は一切発生しない（戦略 5.3 の制約を満たす）
- Series / Collection は 2026 年の優先施策（戦略 §139「Franchise特集ページのNext.js側を実装」）。`franchise` taxonomy は本番稼働中（61ターム）、`/franchise/{slug}` ページも実装済み。本機能はその特集ページへの**TOP からの導線**を作る
- ただし**シリーズの概要文・画像は現状存在しない**（下記「前提の訂正」参照）。本機能はそれを待たず、概要文・画像を**キュレーション枠側に持たせて**着手する（S-1）
- 「{シリーズ名} 見る順番」（戦略 §39）という検索意図への入口になる

---

## 前提の訂正（2026-10-10 実機確認）

初版では `franchise` taxonomy の ACF フィールド（`description` / `hero_image` 等）が実装済みという前提で設計していたが、**本番 API を確認したところ実装されていなかった。**

```
GET https://cms.katsumascore.blog/wp-json/wp/v2/franchise?per_page=100&acf_format=standard
→ 61 ターム / ACF キーは name_ja・name_en の 2 つのみ
```

| 項目 | 設計書（`franchise_acf_design.md`） | 実機 |
|---|---|---|
| `title_override` / `description` / `catch_copy` / `hero_image` | 設計あり | **未実装**（ACF フィールドグループ自体が存在しない） |
| `name_ja` / `name_en` | 設計書に記載なし | **実装済み**（ロケール名出し分け用） |
| WP コア `description`（ターム説明） | — | 61 件中 **7 件のみ**記入済み |

`acf-json/` に `franchise` を location に持つフィールドグループは 1 つも無い（`taxonomy_franchise.json` はタクソノミー定義のみ）。`franchise.ts` の `parseWPFranchiseAcf` は設計書どおりのフィールドをパースする実装になっているが、**現在は常に空を返している**。

### これが設計に与える影響

1. **シリーズ枠の説明文を `franchise` ACF から流用する案は成立しない。** 61 ターム中 54 件は説明文を持たない
2. **シリーズ枠のカード画像も同様に存在しない。** 全ターム画像なし
3. したがってシリーズ枠は、以下のいずれかが前提になる

| 方針 | 内容 | 評価 |
|---|---|---|
| **S-1（推奨）** | キュレーション枠側に `description` / `image` を持たせ、枠ごとに編集部が書く | TOP に出すのは数件なので記入コストが小さい。即着手できる |
| S-2 | `franchise` ACF フィールドグループを新規作成し、出すシリーズだけ埋める | シリーズ特集ページ側も同時に改善される。ただし作業範囲が広がる |
| S-3 | WP コア `description` を使い、空なら作品数のみ表示 | 追加実装ゼロだが 54/61 が無言になる |

**S-1 を推奨する。** 本機能は「編集部が意図を持って選ぶ」枠であり、説明文はシリーズの一般的な概要ではなく**「なぜ今これを推すか」という枠固有の文脈**であるべき。`franchise` ACF の汎用的な概要文とは本来別物で、流用は設計上も筋が良くない。

S-2 は `franchise_acf_design.md` の設計を実装する作業そのもので、本機能とは独立した価値がある。**別タスクとして切り出す**のが適切（`franchise_todo_v2.md` の範囲）。

---

## 既存実装との関係

### 再利用できるもの

| 対象 | 場所 | 用途 |
|---|---|---|
| `franchise` taxonomy | WP 側実装済み（61ターム・本番稼働中） | シリーズの分類・作品数 |
| `getFranchises()` / `getFranchiseBySlug()` | `src/libs/api/wordpress/endpoints/franchise.ts` | シリーズターム取得 |
| `getPostsByFranchiseTermId(termId)` | `src/libs/api/wordpress/endpoints/posts.ts` | シリーズ内の作品一覧 |
| `getTaxonomyUrl('franchise', slug, lang)` | `src/libs/route.ts` | `/franchise/{slug}` の URL 組み立て |
| `HomeCard` / `HomeCardScrollList` | `src/components/ui-home/` | Post のカード表示・横スクロール |
| `loadHomeTemplateProps` | `src/libs/homeStaticProps.ts` | 並列取得に相乗りする |

### 既存枠との違い

`HomeFeatured`（特集枠）は `label` / `title` / `description` / `href` を持つカード 1 枚で、**リンク先が 1 つ**。本機能は 1 つの見出しの下に**複数の作品（またはシリーズ）が並ぶ**。構造が違うため `HomeFeatured` の拡張ではなく新規コンポーネントとする。

`HomeRecommend`（タグ別おすすめ）は構造が近い（見出し + Post 群 × 複数ブロック）が、**タグからランダム自動生成**で説明文を持たない。本機能は手動キュレーション + 説明文が必須。`HomeRecommend` にフラグを足すと「自動 / 手動」「説明文あり / なし」が同一コンポーネントに混ざるため分離する。

---

## データの持ち方

### 共通のデータ型

全ての枠で同じ外枠を使い、中身（`items`）だけが変わる。**WP が返す JSON がこの形**
（`/v1/home-curated`）なので、フロントはパースして型を付けるだけでよい。

```ts
/** TOP のキュレーション枠 1 ブロック */
type CuratedCollection = {
  /** 見出しラベル（例: 「バイオハザードを観る順番」） */
  label: string
  /** 説明文。「なぜ今これを推すか」。未入力なら空文字 */
  description: string
  /** 一覧ページへのリンク。無ければ「すべて見る」を出さない */
  seeAllHref: string | null
} & (
  | { kind: 'posts'; items: Post[] }
  | { kind: 'series' | 'franchise'; items: CuratedSeriesItem[] }
)

/** シリーズ / フランチャイズ枠の 1 項目 */
type CuratedSeriesItem = {
  id: number
  slug: string
  /** series は post_title、franchise は name_ja / name_en をロケール解決した名前 */
  title: string
  /** series は excerpt、franchise は枠側の入力。未入力なら空文字 */
  description: string
  /** 画像。シリーズに無ければ先頭作品記事のアイキャッチ。それも無ければ null */
  image: string | null
  /** 作品記事数（`posts.length` と一致する） */
  postCount: number
  /** このシリーズの作品記事。作品公開日の昇順 */
  posts: Post[]
}
```

- **並び順は WP が決めたものをそのまま使う。** 枠は ACF Repeater の行順、
  作品記事は作品公開日（ACF `release.release_date`）の昇順
- `kind` は `series` と `franchise` で**項目の型が同じ**。UI コンポーネントは
  両者を区別せず描画できる（タイトルのリンク先だけが `/series/{slug}` と
  `/franchise/{slug}` で変わる）
- `postCount` を別に持つのは、将来 `posts` を省略して件数だけ出す形に
  切り替える余地を残すため

### 作品記事を枠に含める理由

初版では「シリーズ名のリストだけ」を返す設計だったが、それでは
「バイオハザード新作公開に合わせて既存作を見せる」という主用途を満たせない。
**シリーズ名だけ出しても、ユーザーはどの作品があるか分からない。**

そのため各シリーズに作品記事を付けて返す。収集は WP 側が行う（優先順位は
`HOME_CURATED_API_SPEC.md` 参照）。フロントは受け取った配列を描画するだけ。

### `description` / `image` の供給元

| `kind` | `description` | `image` |
|---|---|---|
| `series` | 枠側の上書き → series の `excerpt` | series のアイキャッチ → 先頭作品記事の画像 |
| `franchise` | 枠側の入力のみ | 枠側の入力 → 先頭作品記事の画像 |

`franchise` タクソノミーは概要文・画像の ACF フィールドを持たない（「前提の訂正」参照）。
`series` CPT は両方を持つが**実データは 14 件すべて画像未設定**。

いずれの場合も**先頭作品記事のアイキャッチへフォールバックする**ため、
実質的に画像が欠けることはない。記事側にはほぼ必ずアイキャッチがある。

---

## 管理方法: 案A（WordPress / ACF オプションページ）で確定

WP 管理画面に「TOP キュレーション」のオプションページを作り、ACF の Repeater で枠を管理する。**2026-10-10 に案A で確定。**

### 決定の根拠

1. **選択 UI があること。** この枠は「編集部が意図を持って選ぶ」ことに価値がある機能で、選ぶ行為そのものが日常作業になる。ACF Relationship なら記事名で検索して選べる。案B（スプレッドシート）は記事 ID の手入力になり、更新頻度を下げる方向に働いて機能の目的と逆行する
2. **参照整合性を WP に任せられる。** 記事の非公開・削除に自動で追従する。案B では ID の実在を誰も検証しないため、気づかないうちに枠が欠けていく
3. **認証が既存で足りる。** 案B は Google Sheets API の認証をフロントのビルド環境（Cloudflare）に持ち込む必要があり、現状存在しない。WP REST は既に全セクションで使っている

### 採用にあたっての注意（検証済み）

- **既存の `katsumascore-revalidate` プラグインは ACF オプションページの保存を拾えない。** プラグインは `save_post` と投稿のステータス遷移にのみフックしており（`plugins/katsumascore-revalidate/katsumascore-revalidate.php`）、オプションページの保存は投稿を作らないため何も発火しない。さらに現在のパスビルダーは TOP（`/`・`/ja`・`/en`）を一切含まない
- したがって**即時反映は追加実装が前提**。`acf/save_post`（`$post_id === 'options'`）へのフックと TOP パスの追加が必要（実装方針 §1-c）
- **「サブリクエストを増やさない」と「即時反映」は同時に取れない。** ビルド時に JSON へ焼き込めばランタイムのリクエストは 0 本になるが、反映はビルド待ちになる。TOP は既に多数の WP リクエストを撃っており、+1 本の影響は相対的に小さいため、**ランタイム取得 + revalidate（即時反映）を採る**

### 案B（スプレッドシート → JSON）を採らなかった理由の記録

案B にも利点はあった（ランタイムのリクエスト 0 本、`generate-genres.mjs` という既存パターンあり、WP 実装不要、劇場情報と運用場所が一本化）。将来**更新頻度が月1回以下に落ち着き、かつ Workers のサブリクエスト制約が厳しくなった**場合は再検討の価値がある。その際は `scripts/generate-curated-collections.mjs` → `src/data/curatedCollections.json` の形になる。

---


## 実装方針

### 1. WordPress 側（実装済み ✅）

ブランチ `feature/acf-top-curated`。**詳細は
`katsumascore_wordpress_theme/docs/feature/HOME_CURATED_API_SPEC.md` を参照。**

| ファイル | 内容 |
|---|---|
| `inc/acf-top-curated.php` | ACF オプションページ「TOP キュレーション」 |
| `acf-json/group_top_curated.json` | フィールド定義（Repeater・3 kind の Conditional Logic） |
| `inc/api-home-curated.php` | REST `GET /wp-json/v1/home-curated?lang=ja` |
| `plugins/katsumascore-revalidate/` | `acf/save_post` フックで TOP を ISR 再検証 |
| `docs/feature/HOME_CURATED_API_SPEC.md` | 仕様書 |

フロント実装にあたって知っておくべき点だけ再掲する。

- **レスポンスは「データの持ち方」の型そのまま。** 公開状態の確認・言語フィルタ・
  作品記事の収集・公開日順の並べ替え・画像フォールバックはすべて WP 側で完了している
- **項目が 0 件の枠は返らない。** 作品記事が 0 件のシリーズも `items` から除外される。
  フロントで「空の枠」を考慮する必要はない（ただし二重に守る。§3 参照）
- **`lang` を渡す。** 枠側の言語設定と記事の ACF `lang` の両方に効く
- `Cache-Control: s-maxage=600`

### 2. データ取得層（`src/libs/api/wordpress/endpoints/homeCurated.ts`）

- `getHomeCuratedCollections(lang)` を追加。OpenAPI スキーマ外のため、`theaterRelease.ts` と同じ**生 fetch + リトライ**の形に揃える
- 取得失敗・未設定時は**空配列を返す**（`null` ではなく）。枠が無いことは正常状態であり、呼び出し側に分岐を増やさない
- レスポンスのパースは `franchise.ts` の `parseWPFranchiseAcf` と同様に、**フィールドごとに型を検査**する。ACF は未設定時に `false` / `null` / `""` を返しうるため、`z.string().optional()` では落ちる（CLAUDE.md の WP REST スキーマ欠損値チェック参照）
- `kind` が `posts` / `series` のいずれでもない行は**その枠ごと捨てる**。ACF の Radio に将来値が増えても型安全を保つため
- `tests/unit/` にパースのテストを追加する。正常値と、`description: false` / `image: null` / `items: []` の未設定ケースを含める

### 3. TOP のデータ組み立て（`src/libs/homeStaticProps.ts`）

既存の並列 `Promise.all` に相乗りする。

```ts
const [categories, poolRaw, randomTags, vodTerms, theaterReleases, vodReleases, nowShowing, curated] =
  await Promise.all([
    // …既存の取得…
    getHomeCuratedCollections(lang),
  ]);
```

- **並び順は WP が返した配列順をそのまま使う**（ACF Repeater の行順）。フロントで並べ替えない
- 空の枠は WP 側で既に除外済みだが、フロントでも `items.length > 0` で**二重に守る**（既存の `recommendBlocks.filter((b) => b.posts.length > 0)` と同じ扱い）
- Post 側は WP が `lang` で絞って返すが、フロントでも `mapWPPostToPost` を通して `m.lang !== lang` を除外する。CLAUDE.md の「最終フィルタは `m.lang` で行う」に従う
- **WP が落ちてもセクションが欠けるだけで TOP 全体は落とさない。** `getHomeCuratedCollections` が空配列を返すため、既存セクションは通常どおり描画される

### 4. 表示コンポーネント（`src/components/ui-home/`）

`ui-home` レイヤー（**ロジック禁止・props 表示のみ**）に 2 つ追加する。
`series` と `franchise` は項目の型が同じなので**コンポーネントは共通**にできる。

| コンポーネント | 役割 |
|---|---|
| `HomeCuratedPosts` | `kind: 'posts'` の枠。見出し + 説明文 + `HomeCard` の横スクロール |
| `HomeCuratedSeries` | `kind: 'series' \| 'franchise'` の枠。シリーズ見出し + 作品記事リスト |

**`HomeCuratedSeries` は2階層になる**（枠見出し → シリーズ → 作品記事）。
`HomeReleaseHighlight` が「ブロック見出し + 作品リスト」の2階層を既に実装しているので、
構造はそちらを参照する。

- Post 側は既存の `HomeCardScrollList` を**内側で使う**。ただし `HomeCardScrollList` は説明文を持たないため、説明文は外側のラッパーが描画する。`HomeCardScrollList` 自体に `description` を足すと既存 4 箇所の呼び出しに影響するため触らない
- シリーズ見出しのリンク先は `kind` で変わる。`series` は `/series/{slug}`、`franchise` は `getTaxonomyUrl('franchise', slug, lang)`。**ここだけが両者の差**
- 作品記事は `HomeCard` を流用できる（`Post` 型そのままが入っている）
- `description` 未入力・`image` が `null` を**通常状態として扱う**。説明文は `postCount`（「全6作品」等）にフォールバックし、空白が残る作りにしない。ただし画像は WP 側が先頭作品記事のアイキャッチへフォールバックするため、実際には `null` になりにくい
- `data-component` 属性を**ルート要素に必須**で付ける
- SCSS は `src/styles/_app-component-styles.scss` に `@use` を**追加しないと読み込まれない**（`home_release_highlight.md` に記録済みの既知の落とし穴）

> **`/series/{slug}` のページは未実装。** 現状フロントに series CPT のページが無い。
> `kind: 'series'` を使う前に作るか、当面はシリーズ見出しをリンクにしない判断が要る。
> `franchise` は `/franchise/{slug}` が稼働済みなのでそのまま使える。

### 5. HomeTemplate への配置

キュレーション枠は「編集意図」であり、自動生成セクションより上に置く価値がある。一方でニュース性（劇場公開・VOD 配信）には劣る。

```
Hero → 広告バナー(ja) → VOD バッジ凡例 → 劇場公開/VOD配信 最新情報 → 劇場公開中
  → ★キュレーション枠（Repeater 行順） → Ranking → 最新レビュー → 注目のアニメ
  → 高評価 → Recommend → 特集 → VOD
```

枠は**可変個数**なので `collections.map()` でループ描画する。`kind` による分岐は、CLAUDE.md がネスト三項・`switch` を禁止しているため**コンポーネント内の早期 return か、kind をキーにしたマップ**で表現する。

### 6. i18n

`HomeTemplate/i18n.ts` に追加する UI ラベルのみ。

| キー | ja | en | 用途 |
|---|---|---|---|
| `curated.seeAll` | すべて見る → | See all → | 枠右上のリンク |
| `curated.seriesWorkCount` | 全{n}作品 | {n} titles | 説明文未入力時のフォールバック |
| `curated.seriesFallbackAlt` | シリーズ画像 | Series artwork | 画像プレースホルダの alt |

**`label` / `description` は i18n に入れない。** `.claude/rules/src/components/i18n.md` の判断基準どおり、枠ごとに違う文脈コピーは config（ここでは WP 管理のデータ）側が持つ。

### 7. Storybook

- `HomeCuratedPosts` / `HomeCuratedSeries` それぞれに Story
  - `Default` — 標準件数
  - `LongDescription` — 説明文が長い場合の折り返し
  - `SingleItem` — 1 件のみ（横スクロールが成立しない場合のレイアウト）
  - `NoSeeAll` — `seeAllHref` 無し
  - `English` — `globals: { locale: 'en' }`
  - `NoDescription`（シリーズ）— 説明文未入力 → 作品数フォールバック
  - `NoImage`（シリーズ）— 画像なし → プレースホルダ。**現状の全ターム（61件）がこの状態なので最重要ケース**
- `HomeTemplate.stories.tsx` に `collections` のモックと、枠が 0 件の `NoCuratedCollections` を追加

### 8. ドキュメント更新（同一コミット内）

- `docs/FEATURE_LIST.md` — §3 コンポーネント一覧 / §4 ライブラリ関数 / §6 型定義 / §7 i18n
- 実装完了時に本ファイルを `docs/develop/` → `docs/features/` へ移動
- `../obsidian/katsumascore-front/_関連マップ.md` に本ファイルの関連付けを追記
- WP 側も変更するため `../obsidian/_横断マップ.md` も確認する

---

## 実装順序

WP → フロントの順。**WP の REST 応答が実データを返す状態を先に作る**と、フロント側をモックなしで検証できる。

| # | 作業 | リポジトリ | 状態 |
|---|---|---|---|
| 1 | ACF オプションページ登録 | wordpress_theme | ✅ 完了 |
| 2 | フィールドグループ + `acf-json` | wordpress_theme | ✅ 完了 |
| 3 | REST ルート `v1/home-curated` | wordpress_theme | ✅ 完了 |
| 4 | revalidate 拡張（`acf/save_post`） | wordpress_theme | ✅ 完了 |
| 5 | 仕様書 `HOME_CURATED_API_SPEC.md` | wordpress_theme | ✅ 完了 |
| 6 | **WP をデプロイし、枠を1つ登録して `curl` で実応答を確認** | — | ⬜ 次にやる |
| 7 | 型定義 + 取得層（§2） | front | ⬜ |
| 8 | `homeStaticProps` 組み込み（§3） | front | ⬜ |
| 9 | コンポーネント + SCSS 登録（§4） | front | ⬜ |
| 10 | `HomeTemplate` 配置（§5） | front | ⬜ |
| 11 | ドキュメント更新（§8） | 両方 | ⬜ |

**6 を飛ばさない。** WP 側はコードを書いただけで、オプションページに枠を登録した
実データでの応答は未確認である。フロントの型を実応答に合わせてから 7 に進む。

```bash
curl -s "https://cms.katsumascore.blog/wp-json/v1/home-curated?lang=ja" | jq .
```

PR は**リポジトリごとに分ける**（WP テーマとフロントで別リポジトリのため）。
WP 側を先にマージし、フロント側の PR 説明に WP 側 PR へのリンクを張る。

---

## 検証基準

実装時は以下で確認する。

| 対象 | コマンド / 手順 |
|---|---|
| 型 | `npm run typecheck` |
| Lint | `npm run lint` / `npm run lint:scss` |
| WP スキーマ | `npm run test:wp-schema`（ACF 追加時はテストケースも追加） |
| 表示 | `npm run dev` で TOP を開き、枠が **ACF Repeater の行順**に出ること・説明文が表示されること |
| 空状態 | WP の枠を 0 件にして、セクションごと消える（空見出しが残らない）こと |
| 言語 | `/en` で UI ラベルが英語になること・`lang=ja` の枠が出ないこと・日本語の Post が混ざらないこと |
| 作品の並び | `franchise=dune` の枠で Part1 → PART2 の順に出ること（記事の投稿日順ではなく作品公開日順） |
| 画像なし | 画像未指定のシリーズで先頭作品記事の画像が出ること。それも無ければプレースホルダ |
| 非公開追従 | 枠に入れた記事を下書きに戻し、API 応答から消えること（案A の主要な利点の検証） |
| revalidate | ACF オプションページを保存し、`/api/revalidate` が `{ ok: true, paths: ["/ja","/en"] }` を返すこと。**TOP が実際に更新されることまで確認する** |
| WP 停止時 | `WP_API_URL` を不正値にしてビルドし、TOP が既存セクションのみで描画されること |
| Storybook | `npm run storybook` で全 Story がエラーなく描画されること |

---

## 既知の制約・今後の拡張

- **キュレーションは人が行う前提。** AI による自動選定は行わない（CLAUDE.md「レビューは必ず人が最終編集する」の精神に沿う）
- シリーズ枠の説明文・画像は**枠側で編集部が入力する**（S-1）。`franchise` ACF には概要文・画像が存在しないため流用しない
- **`franchise` ACF フィールドグループの実装（`franchise_acf_design.md` の設計）は別タスク。** 実装されればシリーズ特集ページ側が充実するが、本機能はそれを待たずに着手できる
- **`kind: 'series'` は当面使えない。** 2つの未整備がある。
  1. 記事側の ACF `series` リレーションが全記事で未入力（WP 側は franchise 経由の
     フォールバックを実装済みなので動くが、正規の経路ではない）
  2. フロントに `/series/{slug}` のページが無い（`src/pages/` に series が無い）

  **当面は `kind: 'franchise'` を使う。** DUNE・バイオハザードはどちらも franchise 側に
  データがあり、`/franchise/{slug}` も稼働済みのため即運用できる
- series CPT は 14 件すべてアイキャッチ未設定。WP 側が先頭作品記事の画像へ
  フォールバックするため表示は崩れないが、シリーズ固有のビジュアルは出ない
- 未入力の説明文は作品数のみの表示にフォールバックする。記入を必須にして更新頻度が落ちるのを避ける
- 枠数が増えると TOP が縦に伸びる。**同時表示は 2〜3 枠を上限とする運用を推奨**。上限をコード側で強制するかは運用を見て決める
- 枠の `lang` は既定 `ja`。キュレーションのコピーは日本語で書かれる想定のため、`/en` には明示的に `en` または `both` を選んだ枠だけが出る
- ACF オプションページは**リビジョンを持たない**。投稿と違って変更履歴が残らないため、枠を大きく作り替える前は内容を別途記録しておく運用が必要

### 将来の再検討ポイント

- `series` / `series_meta` の二重 Repeater 構造（§1-b の注意）は実装時に単一 Repeater へ寄せる余地がある
- 更新頻度が月1回以下に落ち着き、かつ Workers のサブリクエスト制約が厳しくなった場合は案B（ビルド時 JSON 焼き込み）への移行を検討する
