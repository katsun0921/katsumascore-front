# Franchise ACF設計（完全版）

## ■ 目的
franchise（シリーズ）を単なる分類ではなく、
**特集ページとして機能させるための設計**

---

## ■ 基本方針

- taxonomy（franchise）を主軸とする
- ACFで編集情報を付与
- 投稿データと組み合わせて表示
- 「編集 × データ」のハイブリッド構造

---

## ■ フィールド構成

### ■ 1. 基本情報

| フィールド | 型 | 説明 |
|-----------|----|------|
| title_override | text | 表示タイトル上書き |
| description | textarea | シリーズ概要 |
| catch_copy | text | キャッチコピー |
| hero_image | image | ヒーロー画像 |

---

### ■ 2. メタ情報

| フィールド | 型 | 説明 |
|-----------|----|------|
| start_year | number | 開始年 |
| end_year | number | 終了年（任意） |
| original_author | text | 原作者 |
| production_company | text | 制作会社 |

---

### ■ 3. 表示制御

| フィールド | 型 | 説明 |
|-----------|----|------|
| featured_post | relationship | 代表作品 |
| display_order | select | 表示順（asc/desc） |
| show_timeline | boolean | 時系列表示ON/OFF |
| show_score | boolean | スコア表示ON/OFF |

---

### ■ 4. コンテンツ拡張

| フィールド | 型 | 説明 |
|-----------|----|------|
| timeline_text | repeater | 年表 |
| highlights | repeater | 見どころ |
| related_links | repeater | 外部リンク |

---

#### ■ timeline_text（repeater）

| フィールド | 型 |
|-----------|----|
| year | text |
| content | text |

---

#### ■ highlights（repeater）

| フィールド | 型 |
|-----------|----|
| title | text |
| description | textarea |

---

#### ■ related_links（repeater）

| フィールド | 型 |
|-----------|----|
| label | text |
| url | url |

---

## ■ データ連携

### ■ 投稿との紐付け

- 投稿にfranchise taxonomyを付与
- 自動取得で一覧生成

```ts
getPostsByFranchise(slug)
```

---

## ■ UI構造

```
Hero（画像 + コピー）

▼ 概要（description）

▼ ハイライト（highlights）

▼ 年表（timeline）

▼ 作品一覧（自動生成）
  - 映画
  - アニメ
  - ドラマ

▼ スコア比較

▼ CTA
```

---

## ■ CTA設計

- 「今すぐ観る」
- 「レビューを読む」
- 「配信を見る」

franchiseはCTAを"生む場所"

---

## ■ SEO設計

- title：シリーズ名 + ガイド
- description：シリーズ概要要約
- 内部リンク：投稿への導線強化

---

## ■ 実装注意

- ACFはtaxonomyに紐付ける
- slugは変更しない
- データは必ずAPI経由で取得
- SSR or ISRで生成

---

## ■ 将来拡張

- CPT化（franchise → entity）
- スコア平均算出
- VOD連携
- レコメンド強化

---

## ■ 最終思想

> franchise = メディアの中核

- 情報を集約する
- 行動を生む
- 回遊を最大化する
