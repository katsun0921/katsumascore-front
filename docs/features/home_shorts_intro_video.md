# TOP ページ ショート動画紹介機能

## 概要

記事紹介用のショート動画（YouTube Shorts）を TOP ページに一覧表示し、カードをクリックするとモーダルで再生する機能。

---

## データソース

### WordPress ACF フィールド

| フィールド | 型 | 内容 |
|---|---|---|
| `acf.short_video` | text | ショート動画の URL（`youtube.com/shorts/{id}` 等）または YouTube 動画 ID |

- 投稿自体が ACF `lang`（`ja` / `en`）で言語別に分かれているため、`short_video` の言語振り分けは記事単位で成立する。日本語記事には日本語のショート動画、英語記事には英語のショート動画を入れる
- 想定外の型（空配列・オブジェクト等）が返っても ACF 全体の parse が落ちないよう、文字列以外は `undefined` に丸める（`src/libs/api/wordpress/schema.ts`）

### 動画 ID の抽出

`short_video` は URL・素の動画 ID のどちらでも受け付ける。既存の `extractYoutubeVideoId`（`src/libs/buildPostDetailFromWp/youtube.ts`）を流用し、以下の形式に対応する：

- 素の動画 ID（11 文字）
- `youtube.com/watch?v={id}`
- `youtu.be/{id}`
- `youtube.com/embed/{id}`
- `youtube.com/shorts/{id}`

抽出結果は `Post.shortVideoId`（`src/types/post.ts`）として正規化 `Post` に付与される。付与処理は `mapWPPostToPost`（`src/libs/api/wordpress/transform.ts`）内。

---

## TOP ページへの表示

### データ組み立て（`src/libs/homeStaticProps.ts`）

投稿プールから `shortVideoId` を持つものだけを抽出し、公開日の新しい順に最大 10 件を `HomeTemplateProps.shortVideoPosts` として渡す。

```ts
const shortVideoPosts = pool
  .filter((p) => p.shortVideoId !== undefined)
  .sort(sortByDateDesc)
  .slice(0, 10);
```

### 表示コンポーネント（`src/components/features/HomeShorts`)

`features` レイヤー（hooks / state 使用）。カード一覧の横スクロールリストとモーダル再生の両方を持つため `ui-section` ではなく `features` に配置。

- カード：投稿のアイキャッチ画像を 9:16 サムネイルで表示し、再生ボタンをオーバーレイ
- モーダル：クリックで `youtube.com/embed/{videoId}?autoplay=1&playsinline=1&rel=0` を iframe 埋め込み
- 閉じる操作：閉じるボタン / モーダル背景クリック / Escape キーの 3 経路
- モーダル表示中は `document.body.style.overflow = 'hidden'` で背景スクロールをロックし、閉じたら元の値に復元する

### HomeTemplate 内の配置

`HomeTemplate`（`src/components/templates/HomeTemplate/HomeTemplate.tsx`）で「最新レビュー」セクションの直後に配置。`shortVideoPosts` が 0 件のときはセクションごと非表示になる。

```
Hero → 広告バナー（ja） → VOD バッジ凡例 → Ranking → 最新レビュー
  → ショート動画 → 注目のアニメ → 高評価 → Recommend → 特集 → VOD
```

---

## i18n

`HomeShorts` はコンポーネントローカルの `i18n.ts` を持つ（カードの再生ラベル・モーダルの閉じるラベル）。セクション見出し（「ショート動画で紹介」/ "Intro Shorts"）は `HomeTemplate/i18n.ts` の `shorts.title` に定義。

---

## モック・Storybook

- WP モック（`src/mocks/wp/mockWpDataset.ts`）：日本語記事 2 件・英語記事 1 件に `short_video` を設定済み
- Storybook モック（`src/components/ui-home/mocks/home.ts`）：`mockShortVideoPosts`
- Story：`src/components/features/HomeShorts/HomeShorts.stories.tsx`（Default / SingleItem / NoImage / Empty / English）

---

## 既知の制約

- YouTube 埋め込み iframe はクロスオリジンのため、iframe 内にフォーカスが移ると Escape キーでの閉じ操作が効かなくなる場合がある。閉じるボタン・背景クリックは常に有効
- `short_video` が未入力の記事は自動的にショート動画一覧から除外される（エラーにはならない）
