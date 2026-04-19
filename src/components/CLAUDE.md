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

### ■ 補助ファイル配置ルール
- `types` / `utils` は同一ディレクトリ内だけで閉じる場合のみローカル配置を許可
- 同一ディレクトリ外から参照される `types` / `utils` はグローバルへ移動する
- 型は `src/types/`
- 汎用関数・整形処理は `src/lib/utils/`

---

## ■ docs（Storybook専用）

### ■ 役割
設計・デザイン・ルールの可視化

---

# ■ index.ts ルール（厳守）

## ■ 原則

- **全てのコンポーネントディレクトリに `index.ts` を必ず作成する**
- **コンポーネントのインポートは必ず `index.ts` 経由（ディレクトリ単位）で行う**

## ■ index.ts の書き方

```ts
// ComponentName/index.ts
export { ComponentName } from './ComponentName';
```

型・hooks・utilsをディレクトリ外から参照する場合も `index.ts` からエクスポートする：

```ts
// search/index.ts
export { Search } from './Search';
export { useSearch } from './useSearch';
export type { SearchResult } from './types';
```

## ■ インポートの書き方

```ts
// ✅ 正しい — ディレクトリ単位
import { Header } from '@/components/ui-layout/Header';
import { PostCard } from '@/components/features/Post/PostCard';

// ❌ 禁止 — ファイル直接参照
import { Header } from '@/components/ui-layout/Header/Header';
import { PostCard } from '@/components/features/Post/PostCard/PostCard';
```

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

---

# ■ Config 設計ルール

## ■ 目的
- UIをロジックから分離する
- データを宣言的に管理する
- Storybookと実装の再現性を担保する

---

## ■ スコープ別ルール

### ■ ローカル（コンポーネント専用）

```
ui-section/
  ComponentName/
    ComponentName.tsx
    ComponentName.config.ts
    index.ts
```

### ■ ルール
- configはコンポーネントディレクトリ内に置く
- ファイル名は必ず `ComponentName.config.ts`
- そのコンポーネント専用データのみを持つ

---

### ■ グローバル（プロジェクト共通）

```
config/
  site.config.ts
  theme.config.ts
  ad.config.ts
```

### ■ ルール
- ドメイン単位で命名する（例：site / theme / ad）
- UIに依存しないデータのみを持つ

---

## ■ 禁止事項（重要）

```
config.ts        ← スコープ不明
 data.ts         ← 意味が曖昧
 constants.ts    ← 責務が違う
```

- 抽象的なファイル名は禁止
- configは必ず「所有者」を明示する

---

## ■ 設計原則

> configは「データ」
> ui-sectionは「表現」
> featuresは「ロジック」

---

## ■ 補足（必要な場合のみ）

### ■ 型を同居させる

```ts
export type ComponentConfig = {
  title: string
}

export const componentConfig: ComponentConfig = {
  title: ""
}
```

### ■ Adapterで外部データを変換

```ts
export const toComponentConfig = (data) => {
  return {
    title: data.title
  }
}
```

- WP / API構造を直接UIに渡さない
- 必ずUI用のconfigに変換する

---

# ■ i18n と Config の責務分離ルール

## ■ 原則

- i18n は「翻訳」
- config は「UIの文脈」

この2つは明確に分離する。

---

## ■ i18n の役割

- 同一UIを多言語で切り替えるための仕組み
- グローバルに再利用される文言を管理する

### ■ 対象

- ナビゲーション（例：Home / About）
- ボタン（例：Read more / Submit）
- フォームラベル
- 共通UIテキスト

---

## ■ config の役割

- コンポーネント固有の文脈・コピーを定義する
- UIの意味を構成するデータを持つ

### ■ 対象

- セクション固有の見出し
- 文脈付きコピー（例：レビュー文・説明文）
- UI構造に紐づくテキスト

---

## ■ 判断基準（最重要）

### ■ Q1：同じUIで言語切替するか？
→ YES：i18n  
→ NO：config

---

### ■ Q2：その文言は他コンポーネントでも使うか？
→ YES：i18n  
→ NO：config

---

### ■ Q3：UIの意味そのものか？
→ YES：config  
→ NO：i18n

---

## ■ 禁止事項

- UI固有コピーをi18nに入れる
- 翻訳不要な文言をi18nで管理する
- configとi18nを混在させる

---

## ■ 設計原則

> i18nは「翻訳」  
> configは「文脈」

翻訳と文脈を混ぜないこと。
