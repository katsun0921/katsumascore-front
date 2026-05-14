---
paths:
  - src/components/**
---

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

ui-parts/
ui-layout/
ui-section/
ui-home/
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
- データはpropsで受け取る
- state禁止（データを変化させない）
- hooks は「表示のための読み取り専用」に限り許可（例: `useLocale()` / `useTheme()`）
- propsを書き換えるロジック・副作用禁止

### ■ 例外：WordPress ACF ブロック
`ProductBlock` はWordPress ACF + Gutenbergブロックとして挿入されるコンポーネント。  
実装本体はPHPだが、表示確認のためTSXで実装している。  
Next.jsアプリからはimportされないが、削除禁止。

---

## ■ ui-home（Home ページ専用UI）

### ■ 役割
Home ページ固有の意味あるUIのまとまり（`HomeCard` / `HomeCardScrollList` 等）

### ■ 特徴
- ui-section と同じ責務だが、スコープが Home ページ限定
- HomeTemplate からのみ参照される
- Home 固有のデザイン意図（ダーク背景・固定サイズ・横スクロール等）を閉じ込める

### ■ ルール
- ロジック禁止（hooks / state 禁止）
- データは props で受け取る
- 汎用化されたら `ui-section/` へ昇格する

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

## ■ Q1：propsを書き換えるロジック・state・副作用を持つか？
→ YES：features  
→ NO：次へ

## ■ Q2：意味を持つUIか？（読み取り専用hooksは許可）
→ YES：ui-section  
→ NO：次へ

## ■ Q3：レイアウトか？
→ YES：ui-layout  
→ NO：ui-parts

---

# ■ 設計原則

> uiは「見た目」  
> layoutは「骨格」  
> sectionは「文脈」  
> featuresは「振る舞い」
