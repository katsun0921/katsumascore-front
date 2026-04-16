# ■ Components Architecture

KatsumaScore フロントエンドにおける  
コンポーネント責務とレイヤー構造を定義する。

---

# ■ 目的

- コンポーネントの責務を明確にする
- ロジックとUIを分離する
- 再利用性と保守性を最大化する
- Storybookと実装の整合性を保つ

---

# ■ ディレクトリ構成

```
src/components/

ui/
ui-layout/
ui-section/
features/
```

---

# ■ レイヤー定義

---

## ■ ui（純粋UI）

### ■ 役割
最小単位のUIコンポーネント

### ■ ルール
- propsの値を表示するのみ
- ロジック禁止（hooks / state 禁止）
- ドメイン知識禁止
- i18nのみ許可

### ■ スタイリング
- Tailwind 必須
- SCSSは最小限のみ許可（装飾用途）

---

## ■ ui-layout（構造）

### ■ 役割
UIの配置・レイアウトを定義する

### ■ 特徴
- 意味を持たない
- 構造のみを担う

### ■ ルール
- ロジック禁止
- データ依存禁止
- childrenで構成する

---

## ■ ui-section（意味を持つUI）

### ■ 役割
意味を持ったUIのまとまり

### ■ 特徴
- コンテンツの文脈を持つ
- 見た目の完成単位

### ■ ルール
- ロジック禁止
- データはpropsで受け取る
- hooks禁止

---

## ■ features（ロジック）

### ■ 役割
ドメインロジックと状態管理を持つ

### ■ ルール
- hooks / state 使用可
- データ取得・整形を行う
- ui / ui-section を組み合わせる

---

## ■ docs（Storybook専用）

### ■ 役割
設計・デザイン・ルールの可視化

---

# ■ 判断基準（最重要）

## ■ Q1：ロジックを持つか？
→ YES：features  
→ NO：次へ

## ■ Q2：意味を持つUIか？
→ YES：ui-section  
→ NO：次へ

## ■ Q3：レイアウトか？
→ YES：ui-layout  
→ NO：ui

---

# ■ 設計原則

> uiは「見た目」  
> layoutは「骨格」  
> sectionは「文脈」  
> featuresは「振る舞い」
