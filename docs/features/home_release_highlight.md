# TOP ページ 劇場公開・VOD配信情報ハイライト

## 概要

TOP ページに「今週の劇場公開」「今週のVOD配信開始」の 2 ブロックを表示し、それぞれ直近の週次まとめ記事から抽出した作品タイトルを一覧表示する機能。作品タイトルからは自サイトのレビュー記事、または公式サイト等の外部ページへ遷移できる。

レビューサイトとしての回遊導線に加え、「今週何が公開・配信されるか」という検索意図に TOP から直接応えることを狙う。

---

## データソース

### WordPress カスタム投稿タイプ

| CPT | REST エンドポイント | 内容 |
|---|---|---|
| `theater_release` | `/wp-json/wp/v2/theater_release` | 週次の劇場公開まとめ記事 |
| `vod_release` | `/wp-json/wp/v2/vod_release` | 週次のVOD配信開始まとめ記事 |

どちらも `vod_scraping_api` の news_bot（`theater_publish` / `vod_publish`）が REST API 経由で下書き投稿し、人間が確認して公開する。CPT 定義は `katsumascore_wordpress_theme/acf-json/post-type-{theater,vod}-release.json`。

**ACF フィールドは持たない。** 投稿されるのは `title` / `content` / `status` のみで、excerpt・タクソノミー・アイキャッチはすべて空。したがって作品情報は**本文 HTML から抽出する**必要がある。

### 本文 HTML の構造

news_bot が生成する本文は素の HTML（ブロックエディタのコメントなし）で、以下の構造を持つ。

**劇場公開（`compose_theater.py`）— 公開日別**

```html
<section>
  <h3>8月8日(土)公開</h3>
  <h4>ゴースト・オブ・ウエノ</h4>
  <p>配給: NAKACHIKA</p>
  <p><a href="https://katsumascore.blog/ja/movie/xxx">レビューを読む</a></p>
  <p><a href="https://ghostofueno.com/">公式サイトを見る</a></p>
  <p><a href="https://youtube.com/watch?v=xxx">予告編を観る</a></p>
</section>
```

**VOD配信（`compose_vod.py`）— サービス別**

```html
<section>
  <h3>Disney+</h3>
  <h4>スター・ウォーズ：ビジョンズ／九人目のジェダイ</h4>
  <p>配信開始日: 2026-08-05</p>
  <p>配信種別: 独占</p>
  <p><a href="https://www.disneyplus.com/...">作品詳細を見る</a></p>
</section>
```

冒頭には「今週の注目作」（劇場）/「編集部おすすめ」（VOD）セクションが入ることがあるが、こちらは作品名が `h3` 側に入り `h4` を持たない。

---

## 作品リストの抽出（`src/libs/releaseWorks.ts`）

`extractReleaseWorks(html, max = 6)` が本文 HTML から `ReleaseWorkItem[]` を返す。パーサは `libs/toc.ts` と同じ htmlparser2 + domutils。

```ts
type ReleaseWorkItem = {
  title: string        // h4 のテキスト
  meta?: string        // 直前の h3（劇場: 公開日 / VOD: サービス名）
  href?: string        // 作品の詳細先
  isExternal?: boolean // href が自サイト外を指すか
}
```

### 走査ルール

`h3` / `h4` / `a` を文書順に走査する。

| 要素 | 扱い |
|---|---|
| `h3` | 以降の作品に付く `meta` を更新する |
| `h4` | 新しい作品として `works` に追加する（`max` 件で打ち切り） |
| `a` | 直近の `h4`（作品）のリンク候補として紐づける |

**「今週の注目作」「編集部おすすめ」セクションは `h4` を持たないため、この走査で自然に除外される。** 通常セクションに同じ作品が再掲されるため、除外しないと重複表示になる。

### リンクの優先順位

自サイトのレビュー記事を優先し、無ければ最初の外部リンク（公式サイト / 作品詳細 / 予告編）を採用する。

本文中の出現順に依存しないよう、**公式サイトの後にレビュー記事が現れた場合は上書きして優先する**。

```ts
if (current.href === undefined || (!isExternal && current.isExternal === true)) {
  current.href = href;
  current.isExternal = isExternal;
}
```

### 内部 / 外部の判定と URL 正規化

判定は**ラベル文言ではなく URL のホスト名**で行う。news_bot 側のラベル（「レビューを読む」等）変更に影響されないため。

| 入力 | 判定 | `href` |
|---|---|---|
| `/ja/movie/xxx` | 内部 | `/ja/movie/xxx` |
| `https://katsumascore.blog/ja/movie/xxx` | 内部 | `/ja/movie/xxx`（パスへ正規化） |
| `https://cms.katsumascore.blog/ja/anime/xxx` | 内部 | `/ja/anime/xxx`（同上） |
| `https://ghostofueno.com/` | 外部 | そのまま |
| パース不能な文字列 | 外部 | そのまま |

news_bot はレビュー記事 URL を**絶対 URL** で埋め込むため、正規化しないと `<Link>` に渡しても内部遷移にならない。自サイトとみなすホストは `INTERNAL_HOSTS`（公開ドメインと WP 管理ドメイン）で定義。

---

## TOP ページへの表示

### データ組み立て（`src/libs/homeStaticProps.ts`）

各 CPT の最新 1 件を取得し、本文から作品リストを抽出して `HomeTemplateProps` に渡す。取得は既存の並列 `Promise.all` に相乗りする。

```ts
const [categories, poolRaw, randomTags, vodTerms, theaterReleases, vodReleases] =
  await Promise.all([
    // …既存の取得…
    getTheaterReleases(1),
    getVodReleases(1),
  ]);
```

`toTheaterReleaseHighlight` / `toVodReleaseHighlight` が `ReleaseHighlightBlock` を組み立てる。

```ts
type ReleaseHighlightBlock = {
  href: string          // 週次まとめ記事詳細へのリンク
  works: ReleaseWorkItem[]
  articleTitle: string  // works が空のときのフォールバック表示
}
```

記事自体が存在しない場合は `undefined` を返す。

### 表示コンポーネント（`src/components/ui-home/HomeReleaseHighlight`）

`ui-home` レイヤー（ロジック禁止・props 表示のみ）。HTML 抽出は `libs/` 側で完結させ、コンポーネントは純粋 UI を保つ。

- 劇場・VOD をそれぞれ独立したブロックとして縦に並べる。ブロック見出し（「今週の劇場公開」等）と、右上に週次まとめ記事への「まとめ記事を見る →」を置く
- 作品は `title` + `meta`（公開日 / サービス名）の行で一覧表示。行間は区切り線で分ける（最終行は線なし）
- 作品タイトルのリンクは 3 分岐（`WorkTitle`）：

| 条件 | 要素 |
|---|---|
| `href` なし | `<span>`（テキスト表示のみ） |
| `isExternal === true` | `<a target="_blank" rel="noopener noreferrer">` |
| 内部リンク | `<Link>`（`linkLocaleForHref` で二重ロケール接頭辞を防ぐ） |

外部リンクに `<a>` を使うのは既存の `VodMenuItem` / `ShareButtons` 等と同じ使い分け（CLAUDE.md の `<Link>` 必須ルールは内部遷移が対象）。

- `works` が空の場合は記事タイトル（`articleTitle`）を表示するフォールバックを持つ。抽出ロジックが本文構造の変化で空振りしても、セクションが無言で空にならないようにするため
- 劇場・VOD ともデータが無ければ `null` を返してセクションごと非表示

### HomeTemplate 内の配置

VOD バッジ凡例の直後・Ranking の前。ニュース性の高い情報を上位に置く。

```
Hero → 広告バナー（ja） → VOD バッジ凡例 → 劇場公開/VOD配信 最新情報 → Ranking
  → 最新レビュー → ショート動画 → 注目のアニメ → 高評価 → Recommend → 特集 → VOD
```

---

## i18n

セクション見出しは `HomeTemplate/i18n.ts` の `releaseHighlight` に定義。

| キー | ja | en |
|---|---|---|
| `theaterTitle` | 今週の劇場公開 | In Theaters This Week |
| `vodTitle` | 今週のVOD配信開始 | New on Streaming This Week |
| `seeAll` | まとめ記事を見る → | Read the roundup → |

**まとめ記事本体は日本語のみ**（news_bot が日本語で生成）。`/en` でも同じ日本語の作品名が表示され、UI ラベルのみ英語になる。まとめ記事詳細ページ側は canonical を `/ja/` に固定して重複コンテンツを回避している（`/vod-release`・`/theater-release` の実装を参照）。

---

## スタイル

`src/components/ui-home/HomeReleaseHighlight/HomeReleaseHighlight.scss`。

**SCSS は `src/styles/_app-component-styles.scss` に `@use` を追加しないと読み込まれない**（Next.js 16 では global SCSS を Custom App / Storybook preview からのみ読み込む構成のため）。登録を忘れるとスタイルが一切当たらず、要素がインラインで繋がって表示される。

リンクはホバー時に色変化 + 下線でリンクと分かるようにする。

---

## モック・Storybook

- Story：`HomeReleaseHighlight.stories.tsx`
  - `Default`（レビュー記事あり / 外部リンクのみ / リンク無しの 3 パターンを含む）
  - `LongTitle` — 長いタイトルの折り返し
  - `MixedData` — 劇場のみ（VOD 記事なし）
  - `FallbackNoWorks` — 抽出 0 件のフォールバック表示
  - `Dense` — 各 6 件
  - `Empty` — 両方なし（`null` を返す）
- `HomeTemplate.stories.tsx` にも `theaterReleaseHighlight` / `vodReleaseHighlight` のモックと `NoReleaseHighlight` を用意

---

## 既知の制約・今後の拡張

- **本文 HTML のパースに依存している。** news_bot 側で見出しレベル（`h3` / `h4`）や構造が変わると抽出できなくなる。その場合はフォールバックで記事タイトルのみ表示される（無言の空表示にはならない）。恒久的な解決には CPT に ACF フィールドを持たせ、news_bot が構造化データを送る形への移行が必要
- 表示件数は `extractReleaseWorks` の `max`（既定 6）で制限。現状の記事は 1 週あたり数件のため実質全件表示
- 各 CPT の**最新 1 件のみ**を対象とする。週をまたいで複数記事を出す想定はない
- 作品のアイキャッチ画像は持たない（CPT に画像が無く、本文にも作品画像が含まれないため）。ビジュアル強化するには WP 側で作品画像を持たせる対応が要る
- `/en` に日本語の作品名が出る点は許容している（前述の i18n 節を参照）
