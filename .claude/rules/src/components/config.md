---
paths:
  - src/components/**
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
data.ts          ← 意味が曖昧
constants.ts     ← 責務が違う
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
