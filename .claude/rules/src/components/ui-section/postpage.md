---
paths:
  - src/components/ui-section/PostPage/**
---

# ui-section / post ディレクトリ設計ガイド

## ■ 概要

このディレクトリは「Postページを構成するセクションUI」を管理するための領域です。  
各コンポーネントは **ページの意味単位（セクション）** で分割されます。

---

## ■ 設計思想

### ■ UIは「意味」で分ける

本ディレクトリでは、以下を原則とします：

- 見た目ではなく「役割」で分割する
- CMS構造に依存しない
- 再利用可能な単位で設計する

---

## ■ 対象コンポーネント

例：

- PostHero
- PostContent
- PostGoodPoint
- PostSection

これらはすべて「ページを構成する意味的なセクション」です。

---

## ■ 責務

各コンポーネントは以下の責務を持ちます：

- セクション単位のUI構築
- propsによるデータ受け取り
- 表示ロジック（最小限）

---

## ■ 責務外（禁止事項）

以下はこのディレクトリで扱いません：

- API通信（→ features）
- データ整形（→ features / adapter）
- グローバル状態管理
- 他セクションとの依存

---

## ■ ディレクトリ構成

```
ui-section/
  post/
    PostHero/
      PostHero.tsx
      PostHero.scss
      PostHero.stories.tsx
      index.ts

    PostContent/
    PostGoodPoint/
    PostSection/
```

---

## ■ 実装ルール

### ■ TSX

- DOM構造の定義
- propsの受け取り
- classNameの付与

### ■ SCSS

- コンポーネント固有のスタイルのみ
- 他コンポーネントに依存しない

---

## ■ Storybook

- すべてのコンポーネントはStoryを持つ
- 状態差分（default / edge / empty）を必ず検証する

---

## ■ 命名規則

| 種別 | ルール |
|------|--------|
| コンポーネント | Post + 役割 |
| SCSS | Component.scss |
| index | default export |

---

## ■ 設計判断の基準

新規コンポーネント作成時は以下で判断：

### ■ セクションか？

- ページの意味的なブロックか → YESならここ
- 単なるUI部品か → ui-componentへ

---

## ■ アンチパターン

❌ Postディレクトリに全て詰め込む  
❌ 見た目で分割する  
❌ 他コンポーネントに依存する設計  

---

## ■ 目的

この構造の目的は：

- UIのスケーラビリティ確保
- Storybookとの整合性維持
- Headless CMSとの疎結合

---

## ■ 最後に

このディレクトリは「ページの骨格」を担います。  
設計の質がそのままプロダクトの品質に直結します。

安易に肥大化させず、常に責務を意識してください。
