# CPT ロケール名出し分け設計

## 概要

キャスト（出演者）・監督などの人物名を JA / EN ページで正しいロケール名で表示するための設計と実装方針。

---

## WordPress データ構造

### Person CPT（カスタム投稿タイプ `post_type_person`）

| フィールド | 内容 |
|---|---|
| `title.rendered` | `"ローアル・ユートハウグ / Roar Uthaug"` のように **JA / EN を結合した文字列** |
| `acf.name_ja` | **存在しない**（Person CPT には ACF ローカルフィールドなし） |
| `acf.name_en` | **存在しない**（Person CPT には ACF ローカルフィールドなし） |
| `slug` | パーマリンク用スラッグ（例：`roar-uthaug`） |

Person CPT は `title.rendered` に `"日本語名 / English Name"` 形式で両言語の名前を結合して保存している。`name_ja` / `name_en` の個別フィールドは存在しない。

### タクソノミータームの場合（`actor` / `person` タクソノミー）

ACF フィールドグループ `group_category_names` が `taxonomy == all` に適用されているため、タクソノミータームには以下が存在する：

| フィールド | 内容 |
|---|---|
| `acf.name_ja` | 日本語名 |
| `acf.name_en` | 英語名 |
| `name`（WP プライマリ） | 結合形式 or いずれか一方 |

---

## 名前解決の優先順位

### タクソノミータームが解決できる場合（最優先）

`_embedded['wp:term']` から `actor` / `person` タクソノミーのタームを取得し、  
`acf.name_ja` / `acf.name_en` を locale に応じて使用する。

```
locale === "en" → acf.name_en || acf.name_ja
locale !== "en" → acf.name_ja || acf.name_en
どちらもない   → WP プライマリ name を extractLocaleNameFromCombined でスプリット
```

### フォールバック（Person CPT オブジェクト / プレーンテキスト）

`title.rendered` や `name` フィールドが `"日本語名 / English Name"` 形式の場合、  
`extractLocaleNameFromCombined` でロケールに応じた部分を抽出する。

```ts
// src/libs/buildPostDetailFromWp/creditsActors.ts
const extractLocaleNameFromCombined = (name: string, locale?: string): string => {
  if (!name.includes(" / ")) return name;
  const parts = name.split(" / ");
  return locale === "en" ? parts[parts.length - 1].trim() : parts[0].trim();
};
```

- `" / "` 区切りがある → EN は右側（英語）、JA は左側（日本語）を返す
- 区切りがない → そのまま返す

---

## 処理フロー

```
WP ACF リピータ `actors_filed` / `actors_field` / `cast`
  ↓
各行の `actor` フィールドを解析

[数値 term ID の場合]
  → buildTermIdToActorInfoMap で _embedded タームを検索
  → acf.name_ja / acf.name_en から locale 名を取得（最優先）

[フォールバック順]
  1. ext.name（プレーンテキスト）→ extractLocaleNameFromCombined
  2. ext.actor（person CPT オブジェクト）→ extractPersonInfoFromObject
     → acf.name_ja / acf.name_en（なければ title.rendered をスプリット）
  3. ext.actor_name → extractLocaleNameFromCombined
```

---

## 実装ファイル

| ファイル | 役割 |
|---|---|
| `src/libs/buildPostDetailFromWp/creditsActors.ts` | キャスト・監督の名前解決ロジック全体 |
| `src/libs/buildPostDetailFromWp/buildPostDetail.ts` | `mapActors` / `mapCreditsFromParsedWp` を呼び出し、`locale` を渡す |

---

## 将来の拡張時の注意点

### Person CPT に `name_ja` / `name_en` を追加する場合

WordPress 側で ACF フィールドグループを Person CPT に適用すれば、  
`extractPersonInfoFromObject` がすでに `acf.name_ja` / `acf.name_en` を読む実装になっているため、  
**フロントエンドの変更は不要**。

### 新しい人物系 CPT を追加する場合

1. タクソノミーベースなら `buildTermIdToActorInfoMap` の taxonomy 判定に追加する
2. 投稿タイプベースなら `extractPersonInfoFromObject` がそのまま使える（結合名フォーマット前提）
3. 結合名フォーマット以外の場合は `extractLocaleNameFromCombined` を迂回するパスを追加する

---

## 関連 PR

- PR #177: `extractPersonInfoFromObject` に locale 対応を追加（初回）
- PR #178: `mapActors` のターム解決を `ext.name` より先行させるよう修正
- PR #179: `extractLocaleNameFromCombined` ヘルパー追加・全フォールバックパスに適用
